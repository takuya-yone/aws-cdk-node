import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal, ManagedPolicy, User } from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';
import { Tags } from '@aws-cdk/core';

export class EksClusterStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    vpc: ec2.Vpc,
    publicSecurityGroup: ec2.SecurityGroup,
    privateSecurityGroup: ec2.SecurityGroup,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const EksMasterRole = new Role(this, 'EksMasterRole', {
      assumedBy: new ServicePrincipal('eks.amazonaws.com'),
    });
    EksMasterRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy')
    );
    EksMasterRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy')
    );

    const cluster = new eks.Cluster(this, 'EKS-Sandbox-cluster', {
      vpc: vpc,
      mastersRole: EksMasterRole,
      outputMastersRoleArn: true,
      clusterName: 'EKS-Sandbox-cluster',
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,

      vpcSubnets: [
        vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }),
      ],
      securityGroup: publicSecurityGroup,


      version: eks.KubernetesVersion.V1_21,

      defaultCapacity: 0,
    });

    const autoScalingGroup = cluster.addAutoScalingGroupCapacity(
      'BottlerocketNodes',
      {
        instanceType: new ec2.InstanceType('t3.small'),
        minCapacity: 2,
        maxCapacity: 2,
        machineImageType: eks.MachineImageType.BOTTLEROCKET,
        associatePublicIpAddress: false,
        mapRole: true,
        vpcSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }),
      }
    );
    Tags.of(autoScalingGroup).add('Name', 'EKS-Sandbox-Node');

    autoScalingGroup.addSecurityGroup(privateSecurityGroup);

    // const nodegroup = new eks.Nodegroup(this, 'EKS-Sandbox-NodeGroup', {
    //   cluster: cluster,
    //   amiType: eks.NodegroupAmiType.BOTTLEROCKET_X86_64,
    //   capacityType: eks.CapacityType.ON_DEMAND,
    //   forceUpdate: false,
    //   instanceTypes: [new ec2.InstanceType('t3.small')],
    //   maxSize: 2,
    //   minSize: 2,
    //   nodegroupName: 'EKS-Sandbox-NodeGroup',
    //   subnets: vpc.selectSubnets({
    //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    //   }),
    //   // subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },

    //   tags: {
    //     Name: 'EKS-Sandbox-Node',
    //   },
    // });

    // nodegroup.add

    // kubectlを叩けるIAMを設定しておく。
    const awsAuth = new eks.AwsAuth(this, 'AwsAuth', {
      cluster: cluster,
    });


  }
}
