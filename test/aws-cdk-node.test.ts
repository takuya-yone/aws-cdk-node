import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AwsCdkNode from '../lib/aws-cdk-node-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AwsCdkNode.AwsCdkNodeStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
