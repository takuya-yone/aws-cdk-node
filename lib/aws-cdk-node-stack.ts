import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as lambda from '@aws-cdk/aws-lambda';




export class AwsCdkNodeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcCidr = '10.0.0.0/16';

    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: vpcCidr,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    });

    //////////////////  Security Group //////////////////

    const proxyIP1 = '0.0.0.0/32';
    const proxyIP2 = '0.0.0.0/32';



    //// public security group
    const publicSecurityGroup = new ec2.SecurityGroup(this, 'PublicSG', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'PublicSG',
    });

    //// private security group
    const privateSecurityGroup = new ec2.SecurityGroup(this, 'PrivateSG', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'PrivateSG',
    });

    //// public security group Rule
    publicSecurityGroup.addIngressRule(
      publicSecurityGroup,
      ec2.Port.allTraffic()
    );
    publicSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(proxyIP1),
      ec2.Port.allTraffic()
    );
    publicSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(proxyIP2),
      ec2.Port.allTraffic()
    );
    publicSecurityGroup.addIngressRule(
      privateSecurityGroup,
      ec2.Port.allTraffic()
    );

    //// private security group Rule
    privateSecurityGroup.addIngressRule(
      privateSecurityGroup,
      ec2.Port.allTraffic()
    );
    privateSecurityGroup.addIngressRule(
      publicSecurityGroup,
      ec2.Port.allTraffic()
    );
    ////////////////// ////////////////// //////////////////

    ////////////////// Private Subnet Group for RDS //////////////////

    const rdsSubnetGroup = new rds.SubnetGroup(this, 'RdsSubnetGroup', {
      description: 'RdsSubnetGroup',
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
    });

    //////////////////  //////////////////   //////////////////

    //// add gateway s3 endpoint to private subnet
    const S3GatewayEndpoint = vpc.addGatewayEndpoint('S3GatewayEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.ISOLATED }],
    });

    // //// connect to ecr from isolated
    // const ECRApiInterfaceEndpoint = vpc.addInterfaceEndpoint(
    //   'ECRApiInterfaceEndpoint',
    //   {
    //     // privateDnsEnabled: true,
    //     securityGroups: [privateSecurityGroup],
    //     service: ec2.InterfaceVpcEndpointAwsService.ECR,
    //     subnets: {
    //       subnetType: ec2.SubnetType.ISOLATED,
    //     },
    //   }
    // );
    // //// connect to ecr from isolated
    // const ECRDkrInterfaceEndpoint = vpc.addInterfaceEndpoint(
    //   'ECRDkrInterfaceEndpoint',
    //   {
    //     // privateDnsEnabled: true,
    //     securityGroups: [privateSecurityGroup],
    //     service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    //     subnets: {
    //       subnetType: ec2.SubnetType.ISOLATED,
    //     },
    //   }
    // );
    // //// connect to cwlogs from isolated
    // const CWLogsInterfaceEndpoint = vpc.addInterfaceEndpoint(
    //   'CWLogsInterfaceEndpoint',
    //   {
    //     // privateDnsEnabled: true,
    //     securityGroups: [privateSecurityGroup],
    //     service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    //     subnets: {
    //       subnetType: ec2.SubnetType.ISOLATED,
    //     },
    //   }
    // );

    //////////////////  //////////////////   //////////////////
    const lambdaFunction = new lambda.Function(this, "test-lambda", {
      code: new lambda.AssetCode("resources"),
      handler: "lambda-handler.handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      functionName: "test-lambda",
    });


  }
}
