#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EksVpcStack } from '../lib/eks-vpc-stack';
import { EksClusterStack } from '../lib/eks-cluster-stack';

const app = new cdk.App();

const envTokyo = { region: 'ap-northeast-1' };
const envOsaka = { region: 'ap-northeast-3' };

const VpcStack = new EksVpcStack(app, 'EKS-Sandbox-VPC-Stack', {
  env: envTokyo,
});
// const ClusterStack = new EksClusterStack(app, 'EKS-Sandbox-Cluster-Stack',VpcStack.vpc, { env: envTokyo });
