import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';

export class EksClusterStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    vpc: ec2.Vpc,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // const eksRole = new Role(this, 'eksRole', {
    //   assumedBy: new ServicePrincipal('eks.amazonaws.com'),
    // });
    // eksRole.addManagedPolicy(
    //   ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy')
    // );
    // eksRole.addManagedPolicy(
    //   ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy')
    // );

    const cluster = new eks.Cluster(this, 'EKS-Sandbox-cluster', {
      vpc: vpc,
      // mastersRole: eksRole,
      // outputMastersRoleArn: true,
      clusterName: 'EKS-Sandbox-cluster',
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
      // mastersRole: clusterAdmin,
      // vpcSubnets: [vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED })],
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],

      version: eks.KubernetesVersion.V1_21,

      defaultCapacity: 0,
    });

    const nodegroup = new eks.Nodegroup(this, 'EKS-Sandbox-NodeGroup', {
      cluster: cluster,
      amiType: eks.NodegroupAmiType.BOTTLEROCKET_X86_64,
      capacityType: eks.CapacityType.ON_DEMAND,
      forceUpdate: false,
      instanceTypes: [new ec2.InstanceType('t3.small')],
      maxSize: 2,
      minSize: 2,
      nodegroupName: 'EKS-Sandbox-NodeGroup',
      // subnets:   vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },

      tags: {
        Name: 'EKS-Sandbox-Node',
      },
    });
  }
}
