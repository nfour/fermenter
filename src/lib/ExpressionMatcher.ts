import { CucumberExpression, ParameterTypeRegistry, RegularExpression } from 'cucumber-expressions';

import { IMatch } from '../types';

/**
 * Produces an expression matcher instance
 * from the cucumber-expressions library
 */
export function ExpressionMatcher (match: IMatch, registry?: ParameterTypeRegistry) {
  if (!registry) {
    registry = new ParameterTypeRegistry();
  }

  const matcher = typeof match === 'string'
    ? new CucumberExpression(match, registry)
    : new RegularExpression(match, registry);

  return matcher;
}
