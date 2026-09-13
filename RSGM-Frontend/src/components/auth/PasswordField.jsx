import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

function PasswordField({
  label,
  name,
  placeholder = "Enter your password",
  value,
  onChange,
  required = false,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-700 mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <Lock
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />

        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="
            w-full h-12 rounded-xl
            border border-neutral-200
            bg-neutral-50/70
            pl-11 pr-12
            text-sm text-neutral-900
            placeholder:text-neutral-400
            outline-none
            transition-all duration-200
            focus:bg-white
            focus:border-violet-400
            focus:ring-4
            focus:ring-violet-100
          "
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            text-neutral-400
            hover:text-neutral-700
            transition
          "
        >
          {showPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;