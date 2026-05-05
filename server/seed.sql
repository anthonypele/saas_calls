TRUNCATE TABLE calls RESTART IDENTITY;

INSERT INTO calls (
  customer_name,
  phone_number,
  call_date,
  duration_seconds,
  sentiment,
  status,
  summary,
  next_step
) VALUES
('Acme Operations', '+1 312 555 0101', '2026-04-20 09:15:00', 482, 'Positive', 'Reviewed', 'Customer asked about expanding seats for the support team.', 'Send team pricing overview.'),
('BrightPath Dental', '+1 415 555 0102', '2026-04-21 11:30:00', 319, 'Neutral', 'New', 'Customer needed clarification about monthly reporting exports.', 'Share reporting documentation.'),
('Northstar Logistics', '+1 206 555 0103', '2026-04-22 14:05:00', 742, 'Negative', 'Follow up', 'Customer reported delays getting onboarding questions answered.', 'Schedule onboarding recovery call.'),
('Harbor Cafe Group', '+1 617 555 0104', '2026-04-23 10:45:00', 265, 'Positive', 'Reviewed', 'Customer liked dashboard visibility and asked for manager access.', 'Create manager invite.'),
('Summit Legal', '+1 212 555 0105', '2026-04-24 16:20:00', 531, 'Neutral', 'New', 'Customer compared the product with an existing spreadsheet workflow.', 'Send migration checklist.'),
('Cedar Health', '+1 303 555 0106', '2026-04-25 13:10:00', 408, 'Positive', 'Reviewed', 'Customer confirmed the call review workflow fits their team process.', 'Prepare trial closeout notes.'),
('Atlas Retail', '+1 702 555 0107', '2026-04-26 15:55:00', 615, 'Negative', 'Follow up', 'Customer was confused about user roles and permissions.', 'Walk through role setup.'),
('Greenline HVAC', '+1 813 555 0108', '2026-04-27 08:40:00', 352, 'Neutral', 'New', 'Customer asked whether call summaries can be edited by supervisors.', 'Explain review workflow.'),
('Pioneer Fitness', '+1 512 555 0109', '2026-04-28 12:25:00', 278, 'Positive', 'Reviewed', 'Customer praised faster visibility into missed follow-ups.', 'Ask for pilot feedback quote.'),
('Metro Property Care', '+1 646 555 0110', '2026-04-29 17:35:00', 689, 'Neutral', 'Follow up', 'Customer wanted a clearer process for assigning next steps.', 'Demo assignment workflow.');
