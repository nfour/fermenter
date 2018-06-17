export interface IExpressionMatcher {
  match: (subject: string) => undefined|IArgument[];
}

export interface IArgument {
  getValue: () => string;
}
