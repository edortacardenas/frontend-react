
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Zod schema for password validation
const passwordResetSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

const ResetPassword = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  useEffect(() => {
    if (token) {
      setIsModalOpen(true);
    } else {
      // This component should only be rendered when a token is expected.
      // If no token, it's an invalid state for this page.
      toast.error("Invalid or missing password reset token.");
      navigate('/login', { replace: true }); // Or to a "request password reset" page
    }
  }, [token, navigate]);

  const onSubmit = async (data: PasswordResetFormData) => {
    if (!token) {
      // This should ideally not be reached if useEffect handles the no-token case
      toast.error("Reset token is missing.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword: data.password }), // Changed 'password' to 'newPassword'
      });

      if (response.ok) {
        // const successData = await response.json(); // Uncomment if you expect and need to use JSON data from a successful response
        toast.success("Password change successfully");
        setIsModalOpen(false); // Close modal
        navigate('/login');    // Redirect to login
      } else {
        // Handle HTTP errors (e.g., 4xx, 5xx status codes)
        let backendErrorData: any = {}; // Use 'any' or a more specific error type if known
        try {
          backendErrorData = await response.json(); // Attempt to parse error response as JSON
        } catch (jsonParseError) {
          console.warn("Could not parse error response as JSON:", jsonParseError);
          // Fallback if the error response isn't JSON
          backendErrorData = { message: `Server error: ${response.statusText || 'Failed to process request.'} (Status: ${response.status})` };
        }

        const status = response.status;

        const isPasswordRequirementError =
          status === 422 || // Typically for validation errors
          (status === 400 && backendErrorData?.errorCode === "PASSWORD_POLICY_VIOLATION"); // Example: Bad Request with a specific error code

        if (isPasswordRequirementError) {
          toast.error("Password Invalid try again");
        } else {
          toast.error("An error has occurred try again");
          // Check for specific conditions (e.g., invalid token) to redirect
          const message = typeof backendErrorData?.message === 'string' ? backendErrorData.message.toLowerCase() : '';
          if (status === 400 || status === 401 || status === 404) { // Common statuses for token issues
            if (message.includes('token') || message.includes('link') || backendErrorData?.errorCode === "INVALID_TOKEN") {
              setIsModalOpen(false);
              navigate('/login', { replace: true }); // Or to forgot-password page
            }
          }
        }
      }
    } catch (error) { // This catches network errors (e.g., server down) or other unexpected errors from fetch() itself
      console.error("Password reset failed due to network or unexpected error:", error);
      toast.error("An error has occurred try again");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent 
        className="sm:max-w-[425px]" 
        onPointerDownOutside={(e) => e.preventDefault()} // Prevents closing on overlay click
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevents closing with Escape key
      >
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your new password below. Make sure it meets the required criteria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              placeholder="••••••••"
              disabled={isSubmitting}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-sm text-red-600" role="alert">{errors.password.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPassword;
