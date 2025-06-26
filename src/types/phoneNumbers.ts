export interface PhoneNumber {
  phone_number_id: string;
  phone_number: string;
  display_name: string;
  session_id: string;
}

export interface CreatePhoneNumberRequest {
  phoneNumber: string;
  alias?: string;
  description?: string;
}

export interface UpdatePhoneNumberRequest {
  alias?: string;
  description?: string;
  isActive?: boolean;
}
