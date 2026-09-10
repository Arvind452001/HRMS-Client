import React, { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import PersonalStep from "./steps/PersonalStep";
import ContactStep from "./steps/ContactStep";
import AddressStep from "./steps/AddressStep";
import ProfessionalStep from "./steps/ProfessionalStep";
import IdentificationStep from "./steps/IdentificationStep";
import AccountStep from "./steps/AccountStep";
import BankStep from "./steps/BankStep";
import DocumentsStep from "./steps/DocumentsStep";
import { useNavigate } from "react-router-dom";
import SummaryStep from "./steps/SummaryStep";
import { showSuccess, showError } from "../../../../utils/alert";
import {
  createEmployeeApi,
  updateEmployeeApi,
} from "../../../../api/employee-Api";
import { FormModeContext } from "./context/FormModeContext";
import { steps, buildInitialValues } from "./formConstants";

export default function EmployeeStepForm({
  mode = "create",
  employee = null,
  embedded = false,
  onSuccess,
  onCancel,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isVertical = isView || isEdit;

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const initialValues = useMemo(() => buildInitialValues(employee), [employee]);

  const methods = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    shouldUnregister: false,
  });

  const { handleSubmit } = methods;

  const appendFormData = (formData, data, parentKey = "") => {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value instanceof FileList && value.length > 0) {
        formData.append(formKey, value[0]);
      } else if (value instanceof File) {
        formData.append(formKey, value);
      } else if (typeof value === "object" && value !== null) {
        appendFormData(formData, value, formKey);
      } else if (value !== undefined && value !== null) {
        formData.append(formKey, value);
      }
    });
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (data.professional?.manager === "") {
        delete data.professional.manager;
      }

      const formData = new FormData();
      appendFormData(formData, data);

      const result = isEdit
        ? await updateEmployeeApi(employee._id, formData)
        : await createEmployeeApi(formData);

      await showSuccess(
        "Success",
        result.message ||
          (isEdit
            ? "Employee updated successfully!"
            : "Employee created successfully!"),
      );

      if (onSuccess) onSuccess();
      else navigate("/hr/employees");
    } catch (err) {
      showError(
        "Error",
        err.message || `Failed to ${isEdit ? "update" : "create"} employee`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = [
    PersonalStep,
    ContactStep,
    AddressStep,
    ProfessionalStep,
    IdentificationStep,
    AccountStep,
    BankStep,
    DocumentsStep,
    SummaryStep,
  ][currentStep];

  const verticalSections = [
    { label: "Personal Information", Component: PersonalStep },
    { label: "Contact Information", Component: ContactStep },
    { label: "Address Information", Component: AddressStep },
    { label: "Professional Details", Component: ProfessionalStep },
    { label: "Employee Identification", Component: IdentificationStep },
    { label: "Login Details", Component: AccountStep },
    { label: "Bank Details", Component: BankStep },
    { label: "Documents", Component: DocumentsStep },
  ];

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const heading = isEdit
    ? "Edit Employee"
    : isView
      ? "Employee Details"
      : "Employee Registration";
  const subheading = isEdit
    ? "Update the employee's information"
    : isView
      ? "Review the employee's information"
      : "Fill in the details step by step to onboard a new employee";

  return (
    <FormModeContext.Provider value={{ mode, isView, isEdit }}>
      <div
        className={embedded ? "w-full" : "mx-auto w-full max-w-5xl relative"}
      >
        {!embedded && (
          <div className="mb-5 text-center sm:mb-8 sm:text-left">
            <h1 className="text-xl font-bold text-base-content sm:text-2xl md:text-3xl">
              {heading}
            </h1>
            <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
              {subheading}
            </p>
          </div>
        )}

        {!isVertical && (
          <>
            <div className="mb-5 sm:mb-8">
              <div className="mb-2 flex items-center justify-end sm:hidden">
                <span className="text-xs font-medium text-primary">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-300 sm:hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <ol className="hidden items-start sm:flex">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;
                  const isLast = idx === steps.length - 1;

                  return (
                    <li
                      key={step.label}
                      className={`flex items-center ${isLast ? "" : "flex-1"}`}
                    >
                      <button
                        type="button"
                        onClick={() => setCurrentStep(idx)}
                        className="group flex shrink-0 flex-col items-center gap-1.5"
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-200 md:h-10 md:w-10
                          ${isActive ? "border-primary bg-primary text-primary-content shadow-sm" : ""}
                          ${isCompleted ? "border-primary bg-primary/10 text-primary" : ""}
                          ${!isActive && !isCompleted ? "border-base-300 bg-base-100 text-base-content/40 group-hover:border-primary/40 group-hover:text-primary/70" : ""}
                        `}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4 md:h-5 md:w-5" />
                          ) : (
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                          )}
                        </span>
                        <span
                          className={`hidden max-w-80px text-center text-[11px] font-medium leading-tight md:block md:max-w-none md:text-xs
                          ${isActive ? "text-primary" : isCompleted ? "text-base-content/70" : "text-base-content/40"}
                        `}
                        >
                          {step.label}
                        </span>
                      </button>
                      {!isLast && (
                        <span
                          className={`mt-18px mx-1 h-0.5 flex-1 rounded-full transition-colors duration-200 md:mx-2 md:mt-5 ${idx < currentStep ? "bg-primary" : "bg-base-300"}`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            <div
              className={
                embedded
                  ? ""
                  : "rounded-2xl border border-base-300 bg-base-100 shadow-sm"
              }
            >
              {!embedded && (
                <div className="flex items-center border-b border-base-300 px-4 py-4 sm:px-6">
                  <span className="text-sm font-semibold text-base-content sm:text-base">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
              )}

              <div
                className={embedded ? "" : "px-4 py-5 sm:px-6 sm:py-6 md:px-8"}
              >
                <FormProvider {...methods}>
                  <form
                    onSubmit={(e) => {
                      if (currentStep !== steps.length - 1) {
                        e.preventDefault();
                        return;
                      }
                      handleSubmit(onSubmit)(e);
                    }}
                  >
                    <fieldset className="contents">
                      <StepComponent />
                    </fieldset>

                    <div className="mt-8 flex items-center justify-between gap-3 border-t border-base-300 pt-5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            currentStep > 0 &&
                            setCurrentStep((prev) => prev - 1)
                          }
                          disabled={currentStep === 0}
                          className="btn btn-outline gap-1.5 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>
                        {onCancel && (
                          <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-ghost"
                          >
                            Close
                          </button>
                        )}
                      </div>

                      {currentStep < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentStep < steps.length - 1)
                              setCurrentStep((prev) => prev + 1);
                          }}
                          className="btn btn-primary gap-1.5"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-success gap-1.5"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Submit
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </FormProvider>
              </div>
            </div>
          </>
        )}

        {/* EDIT / VIEW: STACKED LAYOUT (EXTREME FLOATING CORNER PINNED) */}
        {isVertical && (
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative flex flex-col gap-5 pb-16"
            >
              <fieldset disabled={isView} className="contents">
                <div className="space-y-5">
                  {verticalSections.map(({ label, Component }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-base-300 bg-base-100 shadow-sm px-4 py-5 sm:px-6 sm:py-6 md:px-8"
                    >
                      <Component />
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* negative margin bypass properties for total right-bottom alignment inside modal context */}
              {!isView && (
                <div className="sticky bottom-1 right-0 sm:bottom-2 sm:-right-2 z-40 mt-2 self-end p-0">
                  <button
                    type="submit"
                    className="btn btn-success btn-sm sm:btn-md shadow-2xl gap-1.5 translate-x-2 translate-y-2 md:translate-x-4 md:translate-y-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    </FormModeContext.Provider>
  );
}
