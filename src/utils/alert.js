import Swal from "sweetalert2";

// Matches --color-primary in index.css so alerts match the app's brand color
export const PRIMARY_COLOR = "#0284c7";
export const DANGER_COLOR = "#dc2626";
export const CANCEL_COLOR = "#6b7280";

export const showSuccess = (title = "Success", text = "") =>
  Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: PRIMARY_COLOR,
  });

export const showError = (title = "Error", text = "") =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: PRIMARY_COLOR,
  });

export const showWarning = (title = "Warning", text = "") =>
  Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: PRIMARY_COLOR,
  });

export const showInfo = (title = "Info", text = "") =>
  Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: PRIMARY_COLOR,
  });

// Replaces window.confirm(...) — returns true/false (await it)
export const showConfirm = async ({
  title = "Are you sure?",
  text = "",
  confirmButtonText = "Yes, continue",
  cancelButtonText = "Cancel",
  danger = false,
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: danger ? DANGER_COLOR : PRIMARY_COLOR,
    cancelButtonColor: CANCEL_COLOR,
  });

  return result.isConfirmed;
};

// Replaces toast.success/toast.error(...) — small auto-closing corner popup,
// still SweetAlert2 under the hood so it matches the rest of the app.
export const showToast = (icon = "success", title = "") =>
  Swal.fire({
    icon,
    title,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
  });
