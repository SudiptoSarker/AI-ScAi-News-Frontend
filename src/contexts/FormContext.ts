import { createContext, Dispatch, SetStateAction } from "react";

type FormContextType = {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const defaultFormContext: FormContextType = {
  isLoading: false,
  setIsLoading: () => {},
};

export const FormContext = createContext<FormContextType>(defaultFormContext);
