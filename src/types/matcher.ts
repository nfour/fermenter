export interface IExpressionMatcher {
  regexp: RegExp;

  match: (subject: string) => undefined|IArgument[];
}

export interface IArgument {
  getValue: () => string;
}
