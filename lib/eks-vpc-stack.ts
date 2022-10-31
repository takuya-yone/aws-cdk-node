import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';

export class EksVpcStack extends cdk.Stack {
  vpc: ec2.Vpc;
  publicSecurityGroup: ec2.SecurityGroup;
  privateSecurityGroup: ec2.SecurityGroup;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcCidr = '10.0.0.0/16';

    this.vpc = new ec2.Vpc(this, 'EKS-Sandbox-VPC', {
      cidr: vpcCidr,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // //////////////////  Security Group //////////////////

    const proxyIP1 = '0.0.0.0/32';
    // const proxyIP2 = '0.0.0.0/32';

    //// public security group
    this.publicSecurityGroup = new ec2.SecurityGroup(this, 'PublicSG', {
      vpc: this.vpc,
      // allowAllOutbound: false,
      securityGroupName: 'PublicSG',
    });

    //// private security group
    this.privateSecurityGroup = new ec2.SecurityGroup(this, 'PrivateSG', {
      vpc: this.vpc,
      // allowAllOutbound: false,
      securityGroupName: 'PrivateSG',
    });

    //// public security group Rule
    this.publicSecurityGroup.addIngressRule(
      this.publicSecurityGroup,
      ec2.Port.allTraffic()
    );
    this.publicSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(proxyIP1),
      ec2.Port.allTraffic()
    );
    this.publicSecurityGroup.addIngressRule(
      this.privateSecurityGroup,
      ec2.Port.allTraffic()
    );
    // this.publicSecurityGroup.addIngressRule(
    //   ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
    //   ec2.Port.allTraffic()
    // );

    //// private security group Rule
    this.privateSecurityGroup.addIngressRule(
      this.privateSecurityGroup,
      ec2.Port.allTraffic()
    );
    this.privateSecurityGroup.addIngressRule(
      this.publicSecurityGroup,
      ec2.Port.allTraffic()
    );
    //  this.privateSecurityGroup.addIngressRule(
    //     ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
    //     ec2.Port.allTraffic()
    //   );

    ////////////////// ////////////////// //////////////////

    const EC2InterfaceEndpoint = this.vpc.addInterfaceEndpoint(
      'EC2InterfaceEndpoint',
      {
        service: ec2.InterfaceVpcEndpointAwsService.EC2,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        securityGroups: [this.privateSecurityGroup],
      }
    );

    const ECRInterfaceEndpoint = this.vpc.addInterfaceEndpoint(
      'ECRInterfaceEndpoint',
      {
        service: ec2.InterfaceVpcEndpointAwsService.ECR,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        securityGroups: [this.privateSecurityGroup],
      }
    );

    const ECRDockerInterfaceEndpoint = this.vpc.addInterfaceEndpoint(
      'ECRDockerInterfaceEndpoint',
      {
        service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        securityGroups: [this.privateSecurityGroup],
      }
    );

    const STSEndpoint = this.vpc.addInterfaceEndpoint('STSEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.STS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [this.privateSecurityGroup],
    });

    const ElasticLoadbalancingEndpoint = this.vpc.addInterfaceEndpoint(
      'ElasticLoadbalancingEndpoint',
      {
        service: ec2.InterfaceVpcEndpointAwsService.ELASTIC_LOAD_BALANCING,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        securityGroups: [this.privateSecurityGroup],
      }
    );

    const CloudWatchLogsEndpoint = this.vpc.addInterfaceEndpoint(
      'CloudWatchLogsEndpoint',
      {
        service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        securityGroups: [this.privateSecurityGroup],
      }
    );

    const S3GatewayEndpoint = this.vpc.addGatewayEndpoint('S3GatewayEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    });
  }
}
