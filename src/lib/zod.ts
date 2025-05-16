import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })

  export const registerSchema = z
    .object({
      name: z.string().min(3, {
        message: "El nombre de usuario debe tener al menos 3 caracteres.",
      }),
      email: z.string().email({
        message: "Por favor ingresa un correo electrónico válido.",
      }),
      password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
      }),
      confirmPassword: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden.",
      path: ["confirmPassword"],
    })