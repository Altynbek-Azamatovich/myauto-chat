import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTestPartnerRequest {
  partnerLogin: string;
  password: string;
  businessName?: string;
  fullName?: string;
  city?: string;
  phoneNumber?: string;
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

    const { partnerLogin, password, businessName, fullName, city, phoneNumber }: CreateTestPartnerRequest = await req.json();

    // Simple validation
    if (!partnerLogin || partnerLogin.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Login must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating test partner account with login:", partnerLogin);

    // Create email from login
    const partnerEmail = `${partnerLogin.toLowerCase()}@partner.myauto.kz`;

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === partnerEmail);

    let userId: string;

    if (existingUser) {
      console.log("User already exists, updating password:", existingUser.id);
      userId = existingUser.id;
      
      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: password }
      );
      
      if (updateError) {
        console.error("Error updating password:", updateError);
      } else {
        console.log("Password updated successfully");
      }
    } else {
      // Create new auth user with email - NO phone_number to avoid conflicts
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: partnerEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || "Test Partner",
          business_name: businessName || "Test Service",
          city: city || "Almaty",
          partner_login: partnerLogin,
        },
      });

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        return new Response(
          JSON.stringify({ error: "Unable to create partner account", details: createUserError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!newUser.user) {
        return new Response(
          JSON.stringify({ error: "User creation failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User created successfully:", newUser.user.id);
      userId = newUser.user.id;
    }

    // Check if role already exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "partner")
      .maybeSingle();

    if (!existingRole) {
      // Assign partner role
      const { error: roleInsertError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "partner",
        });

      if (roleInsertError) {
        console.error("Error assigning role:", roleInsertError);
        return new Response(
          JSON.stringify({ error: "Unable to configure partner role", details: roleInsertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Partner role assigned successfully");
    } else {
      console.log("Partner role already exists");
    }

    // Check if service partner already exists
    const { data: existingPartner } = await supabaseAdmin
      .from("service_partners")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();

    let servicePartner;

    if (existingPartner) {
      console.log("Service partner already exists, updating:", existingPartner.id);
      // Update existing partner
      const { data: updatedPartner, error: updateError } = await supabaseAdmin
        .from("service_partners")
        .update({
          name: businessName || existingPartner.name,
          partner_login: partnerLogin,
          phone_number: phoneNumber || existingPartner.phone_number,
          city: city || existingPartner.city,
          is_verified: true,
        })
        .eq("id", existingPartner.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating service partner:", updateError);
        return new Response(
          JSON.stringify({ error: "Unable to update partner profile", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      servicePartner = updatedPartner;
    } else {
      // Create service partner record
      const { data: newPartner, error: partnerError } = await supabaseAdmin
        .from("service_partners")
        .insert({
          name: businessName || "Test Service",
          owner_id: userId,
          partner_login: partnerLogin,
          phone_number: phoneNumber,
          city: city || "Almaty",
          is_verified: true,
        })
        .select()
        .single();

      if (partnerError) {
        console.error("Error creating service partner:", partnerError);
        return new Response(
          JSON.stringify({ error: "Unable to create partner profile", details: partnerError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Service partner created successfully:", newPartner.id);
      servicePartner = newPartner;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test partner account created/updated successfully",
        partnerId: servicePartner.id,
        userId: userId,
        login: partnerLogin,
        email: partnerEmail,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-test-partner function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unable to create test partner account",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
