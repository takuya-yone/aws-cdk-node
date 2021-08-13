import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';

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

    ////////////////// Public Security Group //////////////////

    const proxyIP1 = '0.0.0.0/32';
    const proxyIP2 = '0.0.0.0/32';

    const pubSecurityGroup = new ec2.SecurityGroup(this, 'PublicSG', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'PublicSG',
    });

    // Ingress Rule
    pubSecurityGroup.addIngressRule(pubSecurityGroup, ec2.Port.allTraffic());
    pubSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(proxyIP1),
      ec2.Port.allTraffic()
    );
    pubSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(proxyIP2),
      ec2.Port.allTraffic()
    );

    ////////////////// ////////////////// //////////////////

    ////////////////// Public Security Group //////////////////

    const privateSecurityGroup = new ec2.SecurityGroup(this, 'PrivateSG', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'PrivateSG',
    });

    // Ingress Rule
    privateSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpcCidr),
      ec2.Port.allTraffic()
    );

    ////////////////// Private Subnet Group for RDS //////////////////
    
    const rdsSubnetGroup = new rds.SubnetGroup(this,'RdsSubnetGroup',{
      description:'RdsSubnetGroup',
      vpc: vpc,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.ISOLATED })
    });
    
    //////////////////  //////////////////   //////////////////

    
    
  }
}
