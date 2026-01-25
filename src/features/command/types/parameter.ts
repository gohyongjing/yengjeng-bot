export type Parameter<T> = {
  name: string;
  helpMessage: string;
  processor: (
    value: string,
  ) =>
    | { isSuccess: true; value: T }
    | { isSuccess: false; errorMessage: string };
};
