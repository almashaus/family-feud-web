import { supabase } from "./supabase";

interface CreateUserParams {
  email: string;
  password: string;
  displayName: string;
  isAdmin?: boolean;
}

interface CreateUserResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Creates a new user with email/password and additional data
 */
async function createUser({
  email,
  password,
  displayName,
}: CreateUserParams): Promise<CreateUserResponse> {
  try {
    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    return {
      success: true,
      userId: authData.user.id,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}

export { createUser, type CreateUserParams, type CreateUserResponse };

interface UpdateMetadataParams {
  userId: string;
  displayName?: string;
  isAdmin?: boolean;
  [key: string]: any;
}

interface UpdateMetadataResponse {
  success: boolean;
  error?: string;
}

export async function updateUserMetadata({
  displayName,
  ...otherMetadata
}: UpdateMetadataParams): Promise<UpdateMetadataResponse> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        ...otherMetadata,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updatePassword({
  newPassword,
}: {
  newPassword: string;
}): Promise<CreateUserResponse> {
  try {
    // Create the auth user
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      userId: data.user.id,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}
