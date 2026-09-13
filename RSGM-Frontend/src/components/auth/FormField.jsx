function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-700 mb-2"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full h-12 rounded-xl
            border border-neutral-200
            bg-neutral-50/70
            text-sm text-neutral-900
            placeholder:text-neutral-400
            outline-none
            transition-all duration-200
            focus:bg-white
            focus:border-violet-400
            focus:ring-4
            focus:ring-violet-100
            ${Icon ? "pl-11 pr-4" : "px-4"}
          `}
        />
      </div>
    </div>
  );
}

export default FormField;