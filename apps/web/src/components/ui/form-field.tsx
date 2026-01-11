import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { LucideIcon } from "lucide-react";

type BaseFormFieldProps = {
  label?: string;
  labelIcon?: LucideIcon;
  leftInnerIcon?: LucideIcon;
  error?: string | null;
  touched?: boolean;
  showError?: boolean;
  showCounter?: boolean;
};

type InputFormFieldProps = BaseFormFieldProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onBlur"
  > & {
    type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    as?: "input";
  };

type TextareaFormFieldProps = BaseFormFieldProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "onBlur"
  > & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    as: "textarea";
    autoGrow?: boolean;
  };

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps;

export function FormField(props: FormFieldProps) {
  const {
    label,
    labelIcon: LabelIcon,
    leftInnerIcon: LeftInnerIcon,
    value,
    onChange,
    onBlur,
    error,
    touched = false,
    showError = true,
    showCounter = false,
    id,
    name,
    className = "",
    as,
    ...restProps
  } = props;

  const inputId = id || name;
  const hasError = touched && error && showError;
  const isTextarea = as === "textarea";

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="flex items-center gap-2">
        {LabelIcon && <LabelIcon className="h-4 w-4" />}
        {label}
      </Label>
      <div className="relative">
        {LeftInnerIcon && !isTextarea && (
          <LeftInnerIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        {isTextarea ? (
          <Textarea
            id={inputId}
            name={name}
            value={value}
            onChange={
              onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void
            }
            onBlur={onBlur}
            className={hasError ? `border-destructive ${className}` : className}
            {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            id={inputId}
            name={name}
            value={value}
            onChange={
              onChange as (e: React.ChangeEvent<HTMLInputElement>) => void
            }
            onBlur={onBlur}
            className={
              hasError
                ? `border-destructive ${LeftInnerIcon ? "pl-10 " : ""}${className}`
                : `${LeftInnerIcon ? "pl-10 " : ""}${className}`
            }
            {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {showCounter && typeof value === "string" && (
          <div className="mt-1 text-xs text-muted-foreground flex justify-end">
            {(restProps as InputHTMLAttributes<HTMLInputElement>).maxLength ? (
              <span>
                {value.length} /{" "}
                {(restProps as InputHTMLAttributes<HTMLInputElement>).maxLength}
              </span>
            ) : (
              <span>{`${value.length} chars`}</span>
            )}
          </div>
        )}
      </div>
      {hasError && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
