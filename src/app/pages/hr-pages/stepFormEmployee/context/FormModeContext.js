import { createContext, useContext } from "react";

// mode: "create" | "view" | "edit"
export const FormModeContext = createContext({
  mode: "create",
  isView: false,
  isEdit: false,
});

export const useFormMode = () => useContext(FormModeContext);
