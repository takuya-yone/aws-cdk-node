#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkNodeStack } from '../lib/aws-cdk-node-stack';

const app = new cdk.App();

const envTokyo = { region: 'ap-northeast-1' };
const envOsaka = { region: 'ap-northeast-3' };

new AwsCdkNodeStack(app, 'YonezawaSandboxEKS', { env: envTokyo });
// new AwsCdkNodeStack(app, 'ITBCP-BaseStack-Osaka', { env: envOsaka });
