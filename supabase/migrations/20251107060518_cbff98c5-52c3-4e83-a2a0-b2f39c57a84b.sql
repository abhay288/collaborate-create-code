-- Enable realtime for verified_jobs table
ALTER TABLE verified_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE verified_jobs;

-- Enable realtime for colleges table
ALTER TABLE colleges REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE colleges;

-- Enable realtime for verified_scholarships table
ALTER TABLE verified_scholarships REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE verified_scholarships;