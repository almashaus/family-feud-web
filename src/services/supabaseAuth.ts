import { supabaseAuth } from "./supabase";

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
  isAdmin = false,
}: CreateUserParams): Promise<CreateUserResponse> {
  try {
    // Create the auth user
    const { data: authData, error: authError } =
      await supabaseAuth.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
          is_admin: isAdmin,
        },
      });

    if (authError) {
      console.log("authError :>> ", authError);
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
    console.log("error :>> ", error);
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
  userId,
  displayName,
  isAdmin,
  ...otherMetadata
}: UpdateMetadataParams): Promise<UpdateMetadataResponse> {
  try {
    const { data, error } = await supabaseAuth.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          display_name: displayName,
          is_admin: isAdmin,
          ...otherMetadata,
        },
      }
    );

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
