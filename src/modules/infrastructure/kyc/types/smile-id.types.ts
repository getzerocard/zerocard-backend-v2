export interface GenerateLinkParams {
  user_id: string;
  job_type: string;
  job_id: string;
  callback_url: string;
  user_data: {
    first_name: string;
    last_name: string;
    dob: string;
    country: string;
    id_type: string;
    id_number: string;
  };
}
