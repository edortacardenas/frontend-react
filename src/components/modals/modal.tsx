import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
  } from "@/components/ui/dialog"

import {
InputOTP,
InputOTPGroup,
InputOTPSeparator,
InputOTPSlot,
} from "@/components/ui/input-otp"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom";

type ModalProps = {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  email: string;
  otp: string;
  setOtp: (value: string) => void;
  handleVerifyOtp: () => void;
  handleResendOtp: () => void;
}

function Modal({ showModal, setShowModal, email, otp, setOtp, handleVerifyOtp, handleResendOtp }: ModalProps) {
    const navigate = useNavigate();

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent  
      aria-description="Verifica tu correo electrónico para obtener el OTP"
      className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6 dark:bg-gray-800"
      >
        <DialogHeader className="m-auto flex flex-col items-center space-y-4">
          <DialogTitle className="text-2xl m-auto font-bold text-gray-900 dark:text-white">
            Verificación de OTP
          </DialogTitle>
          <DialogDescription className="m-auto text-sm text-gray-600 dark:text-gray-400">
            This is a modal for verifying OTP. Please enter the OTP sent to your email.
          </DialogDescription>
        </DialogHeader>
        <div className="m-auto flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
          <div className="w-4/5 flex flex-col items-center">
            <label className="block text-sm m-auto mb-2 font-medium text-gray-700 dark:text-gray-400">Email:</label>
            <Input 
            type="email" 
            value={email} 
            readOnly 
            className="w-full mt-2 text-sm text-center py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div >
          <div className="flex flex-col items-center mt-4">
          <label className="block text-sm m-auto mb-2 font-medium text-gray-700 dark:text-gray-400">OTP:</label>
            <InputOTP 
              className="w-full mt-4  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              maxLength={6}
              value={otp}
              onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot
                className="w-10 h-10 m-1 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                index={0} />
                <InputOTPSlot
                className="w-10 h-10 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                index={1} />
              </InputOTPGroup>
              <InputOTPSeparator className="text-gray-500 dark:text-gray-400" />
              <InputOTPGroup>
                <InputOTPSlot
                  className="w-10 h-10 m-1 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  index={2} />
                <InputOTPSlot
                  className="w-10 h-10 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  index={3} />
              </InputOTPGroup>
              <InputOTPSeparator className="text-gray-500 dark:text-gray-400" />
              <InputOTPGroup>
                <InputOTPSlot
                  className="w-10 h-10 m-1 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  index={4} />
                <InputOTPSlot
                  className="w-10 h-10 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center m-auto mt-4 space-x-4">
          <Button onClick={handleVerifyOtp} disabled={!otp}>
            Verificar OTP
          </Button>
          <Button variant="secondary" onClick={() => { setShowModal(false); navigate("/login"); }}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleResendOtp}>
            Reenviar OTP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default Modal
