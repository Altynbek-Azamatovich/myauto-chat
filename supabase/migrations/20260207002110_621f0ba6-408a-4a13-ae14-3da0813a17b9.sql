
-- Fix ALL RLS policies: change from RESTRICTIVE to PERMISSIVE
-- The security hardening accidentally made all policies RESTRICTIVE,
-- which blocks ALL data access since restrictive policies alone deny everything.

-- ============ profiles ============
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can view basic profile info" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============ user_vehicles ============
DROP POLICY IF EXISTS "Users can view their own vehicles or orphaned" ON public.user_vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.user_vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.user_vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.user_vehicles;

CREATE POLICY "Users can view their own vehicles or orphaned" ON public.user_vehicles FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can insert their own vehicles" ON public.user_vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON public.user_vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON public.user_vehicles FOR DELETE USING (auth.uid() = user_id);

-- ============ car_brands ============
DROP POLICY IF EXISTS "Anyone can view car brands" ON public.car_brands;
CREATE POLICY "Anyone can view car brands" ON public.car_brands FOR SELECT USING (true);

-- ============ diagnostic_reports ============
DROP POLICY IF EXISTS "Users can view their own reports" ON public.diagnostic_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.diagnostic_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.diagnostic_reports;

CREATE POLICY "Users can view their own reports" ON public.diagnostic_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.diagnostic_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.diagnostic_reports FOR DELETE USING (auth.uid() = user_id);

-- ============ notifications ============
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ============ user_roles ============
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ chat_conversations ============
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

-- ============ chat_messages ============
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- ============ help_requests ============
DROP POLICY IF EXISTS "Authenticated users can view active help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can create their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can update their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can delete their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Anyone can claim unclaimed active request" ON public.help_requests;

CREATE POLICY "Authenticated users can view active help requests" ON public.help_requests FOR SELECT USING ((status = 'active') OR (auth.uid() = user_id) OR (auth.uid() = responder_id));
CREATE POLICY "Users can create their own help requests" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own help requests" ON public.help_requests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own help requests" ON public.help_requests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can claim unclaimed active request" ON public.help_requests FOR UPDATE USING ((status = 'active') AND (responder_id IS NULL) AND (user_id <> auth.uid())) WITH CHECK (responder_id = auth.uid());

-- ============ help_responses ============
DROP POLICY IF EXISTS "Authenticated users can view help responses" ON public.help_responses;
DROP POLICY IF EXISTS "Users can create their own responses" ON public.help_responses;

CREATE POLICY "Authenticated users can view help responses" ON public.help_responses FOR SELECT USING (EXISTS (SELECT 1 FROM help_requests WHERE help_requests.id = help_responses.help_request_id AND (help_requests.user_id = auth.uid() OR help_requests.responder_id = auth.uid() OR help_requests.status = 'active')));
CREATE POLICY "Users can create their own responses" ON public.help_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);

-- ============ help_chat_messages ============
DROP POLICY IF EXISTS "Users can view help chat messages" ON public.help_chat_messages;
DROP POLICY IF EXISTS "Users can send help chat messages" ON public.help_chat_messages;

CREATE POLICY "Users can view help chat messages" ON public.help_chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM help_requests hr WHERE hr.id = help_chat_messages.help_request_id AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid())));
CREATE POLICY "Users can send help chat messages" ON public.help_chat_messages FOR INSERT WITH CHECK ((auth.uid() = sender_id) AND (EXISTS (SELECT 1 FROM help_requests hr WHERE hr.id = help_chat_messages.help_request_id AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid()))));

-- ============ service_partners ============
DROP POLICY IF EXISTS "Authenticated users can view verified partners" ON public.service_partners;
DROP POLICY IF EXISTS "Partners can manage their own service" ON public.service_partners;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.service_partners;

CREATE POLICY "Authenticated users can view verified partners" ON public.service_partners FOR SELECT USING ((is_verified = true) OR (owner_id = auth.uid()));
CREATE POLICY "Partners can manage their own service" ON public.service_partners FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all partners" ON public.service_partners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ service_requests ============
DROP POLICY IF EXISTS "Users can view their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can update their pending requests" ON public.service_requests;
DROP POLICY IF EXISTS "Partners can view requests for their service" ON public.service_requests;
DROP POLICY IF EXISTS "Partners can update requests for their service" ON public.service_requests;

CREATE POLICY "Users can view their own requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending requests" ON public.service_requests FOR UPDATE USING ((auth.uid() = user_id) AND (status = 'pending'));
CREATE POLICY "Partners can view requests for their service" ON public.service_requests FOR SELECT USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));
CREATE POLICY "Partners can update requests for their service" ON public.service_requests FOR UPDATE USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- ============ service_history ============
DROP POLICY IF EXISTS "Users can view service history for their vehicles" ON public.service_history;
DROP POLICY IF EXISTS "Users can insert service history for their vehicles" ON public.service_history;
DROP POLICY IF EXISTS "Users can update service history for their vehicles" ON public.service_history;
DROP POLICY IF EXISTS "Users can delete service history for their vehicles" ON public.service_history;

CREATE POLICY "Users can view service history for their vehicles" ON public.service_history FOR SELECT USING (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));
CREATE POLICY "Users can insert service history for their vehicles" ON public.service_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));
CREATE POLICY "Users can update service history for their vehicles" ON public.service_history FOR UPDATE USING (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));
CREATE POLICY "Users can delete service history for their vehicles" ON public.service_history FOR DELETE USING (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));

-- ============ reviews ============
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ============ services ============
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Partners can manage their services" ON public.services;

CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Partners can manage their services" ON public.services FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- ============ orders ============
DROP POLICY IF EXISTS "Partners can manage their orders" ON public.orders;
CREATE POLICY "Partners can manage their orders" ON public.orders FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- ============ order_services ============
DROP POLICY IF EXISTS "Partners can manage order services" ON public.order_services;
CREATE POLICY "Partners can manage order services" ON public.order_services FOR ALL USING (order_id IN (SELECT o.id FROM orders o JOIN service_partners sp ON o.partner_id = sp.id WHERE sp.owner_id = auth.uid()));

-- ============ clients ============
DROP POLICY IF EXISTS "Partners can manage their clients" ON public.clients;
CREATE POLICY "Partners can manage their clients" ON public.clients FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- ============ shifts ============
DROP POLICY IF EXISTS "Partners can manage their shifts" ON public.shifts;
CREATE POLICY "Partners can manage their shifts" ON public.shifts FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- ============ masters ============
DROP POLICY IF EXISTS "Partners can manage their masters" ON public.masters;
DROP POLICY IF EXISTS "Partners can view their masters" ON public.masters;

CREATE POLICY "Partners can manage their masters" ON public.masters FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));
CREATE POLICY "Partners can view their masters" ON public.masters FOR SELECT USING ((partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid())) OR (user_id = auth.uid()));

-- ============ service_works ============
DROP POLICY IF EXISTS "Users can view works for their requests" ON public.service_works;
DROP POLICY IF EXISTS "Partners can manage works for their requests" ON public.service_works;
DROP POLICY IF EXISTS "Masters can manage their own works" ON public.service_works;

CREATE POLICY "Users can view works for their requests" ON public.service_works FOR SELECT USING (request_id IN (SELECT id FROM service_requests WHERE user_id = auth.uid()));
CREATE POLICY "Partners can manage works for their requests" ON public.service_works FOR ALL USING (request_id IN (SELECT sr.id FROM service_requests sr JOIN service_partners sp ON sr.partner_id = sp.id WHERE sp.owner_id = auth.uid()));
CREATE POLICY "Masters can manage their own works" ON public.service_works FOR ALL USING (master_id IN (SELECT id FROM masters WHERE user_id = auth.uid()));

-- ============ partner_applications ============
DROP POLICY IF EXISTS "Anyone can submit partner application" ON public.partner_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.partner_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.partner_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.partner_applications;

CREATE POLICY "Anyone can submit partner application" ON public.partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all applications" ON public.partner_applications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update applications" ON public.partner_applications FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete applications" ON public.partner_applications FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ admin_settings ============
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
CREATE POLICY "Admins can manage settings" ON public.admin_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ audit_logs ============
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ============ otp_codes ============
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;
CREATE POLICY "Service role can manage OTP codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

-- ============ rate_limits ============
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits FOR ALL USING (true) WITH CHECK (true);

-- ============ siem_config ============
DROP POLICY IF EXISTS "Only admins can manage SIEM config" ON public.siem_config;
CREATE POLICY "Only admins can manage SIEM config" ON public.siem_config FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
