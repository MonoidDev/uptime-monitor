import { ErrorPredicate } from 'graphql/client/generated';

export const mapErrorPredicateExplanation = (predicate: string) => {
  switch (predicate as ErrorPredicate) {
    case ErrorPredicate.Http_2XxOnly:
      return 'The response is considered to be OK only when the error code is between 200 and 299';
    case ErrorPredicate.HttpNot_5Xx:
      return 'The response is considered to be OK when the error code is not >= 500';
    default:
      return predicate;
  }
};
