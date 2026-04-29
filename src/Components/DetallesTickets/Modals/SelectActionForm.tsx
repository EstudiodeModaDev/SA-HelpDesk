import * as React from "react";
import Select, { type GroupBase, type Props as SelectProps } from "react-select";
import "./ModalsStyles.css";

type BaseOption = {
  value: string;
  label: string;
};

type Props<Option extends BaseOption> = {
  label: string;
  options: Option[];
  value: Option | null;
  onChange: (option: Option | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  placeholder?: string;
  error?: string;
  generalError?: string;
  submitting?: boolean;
  loading?: boolean;
  submitText: string;
  noOptionsMessage?: () => string;
  isClearable?: boolean;
  components?: SelectProps<Option, false, GroupBase<Option>>["components"];
};

export default function SelectActionForm<Option extends BaseOption>({
  label,
  options,
  value,
  onChange,
  onSubmit,
  placeholder,
  error,
  generalError,
  submitting = false,
  loading = false,
  submitText,
  noOptionsMessage,
  isClearable = true,
  components,
}: Props<Option>) {
  return (
    <div className="dta-form">
      <form onSubmit={onSubmit} noValidate className="dta-grid">
        <div className="dta-field">
          <label className="dta-label">{label}</label>
          <Select<Option, false>
            options={options}
            placeholder={placeholder}
            value={value}
            onChange={(opt) => onChange(opt ?? null)}
            classNamePrefix="rs"
            isDisabled={submitting || loading}
            isLoading={loading}
            components={components}
            noOptionsMessage={noOptionsMessage}
            isClearable={isClearable}
            menuPosition="fixed"
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 999999 }),
            }}
          />
          {error && <small className="error">{error}</small>}
          {generalError && <small className="error">{generalError}</small>}
        </div>

        <div className="dta-actions dta-col-2">
          <button type="submit" disabled={submitting || loading} className="btn-primary">
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}
