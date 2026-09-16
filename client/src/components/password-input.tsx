import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Digite sua senha",
  className,
  disabled,
  name,
  id,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("pr-10", className)}
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={togglePassword}
        disabled={disabled}
        tabIndex={-1}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent focus:outline-none focus:ring-0"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pointer-events-none" />
        ) : (
          <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pointer-events-none" />
        )}
      </Button>
    </div>
  );
}