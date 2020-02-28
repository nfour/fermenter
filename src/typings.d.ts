// tslint:disable:max-classes-per-file

declare module 'gherkin';
declare module 'jest-circus';
declare module 'is-valid-path';

// declare module 'cucumber-expressions' {
//   type IMatch = RegExp|string;

//   class ExpressionMatcher {
//     regexp: RegExp;
//     source: IMatch;

//     constructor (match: IMatch, registry?: ParameterTypeRegistry);

//     match (match: IMatch): undefined|IExpressionArgument[];
//   }

//   interface IExpressionArgument {
//     getValue: () => string|number;
//   }

//   export class CucumberExpression extends ExpressionMatcher {}
//   export class RegularExpression extends ExpressionMatcher {}
//   export class ParameterTypeRegistry {}
// }
