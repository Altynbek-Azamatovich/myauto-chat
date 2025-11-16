import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreatePartnerRequest {
  applicationId: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !adminUser) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error("User is not an admin");
    }

    const { applicationId, password }: CreatePartnerRequest = await req.json();

    // Get application details
    const { data: application, error: appError } = await supabaseAdmin
      .from("partner_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("status", "pending")
      .single();

    if (appError || !application) {
      throw new Error("Application not found or already processed");
    }

    console.log("Creating partner account for:", application.phone_number);

    // Create auth user with phone number
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      phone: application.phone_number,
      password: password,
      phone_confirm: true,
      user_metadata: {
        full_name: application.full_name,
        business_name: application.business_name,
        city: application.city,
      },
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      return new Response(
        JSON.stringify({ error: 'Unable to create partner account. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser.user) {
      throw new Error("User creation failed");
    }

    console.log("User created successfully:", newUser.user.id);

    // Assign partner role
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role: "partner",
      });

    if (roleInsertError) {
      console.error("Error assigning role:", roleInsertError);
      return new Response(
        JSON.stringify({ error: 'Unable to configure partner account. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Partner role assigned successfully");

    // Create service partner record
    const { data: servicePartner, error: partnerError } = await supabaseAdmin
      .from("service_partners")
      .insert({
        name: application.business_name || application.full_name,
        owner_id: newUser.user.id,
        phone_number: application.phone_number,
        city: application.city,
        description: application.business_description,
        is_verified: true,
      })
      .select()
      .single();

    if (partnerError) {
      console.error("Error creating service partner:", partnerError);
      return new Response(
        JSON.stringify({ error: 'Unable to create partner profile. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Service partner created successfully:", servicePartner.id);

    // Update application status
    const { error: updateError } = await supabaseAdmin
      .from("partner_applications")
      .update({
        status: "approved",
        approved_by: adminUser.id,
        approved_at: new Date().toISOString(),
        partner_password: password, // Store for admin reference
        notes: (application.notes || "") + `\nОдобрено админом. Аккаунт создан.`,
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      throw new Error(`Failed to update application: ${updateError.message}`);
    }

    console.log("Application approved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Partner account created successfully",
        partnerId: servicePartner.id,
        userId: newUser.user.id,
        phone: application.phone_number,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-partner-account function:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Unable to create partner account. Please try again later.'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);