import { parseFeature } from '../parseFeature';

it('can handle a linux filepath', () => {
  const feature = parseFeature({ feature: '../../tests/calculator.feature' });

  expect(feature).toMatchObject(<typeof feature> {
    text: expect.any(String),
  });
});
it('can handle a windows filepath', () => {
  const feature = parseFeature({ feature: '..\\..\\tests\\calculator.feature' });

  expect(feature).toMatchObject(<typeof feature> {
    text: expect.any(String),
  });
});
