import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class AwsCdkNodeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpcCidr = '10.0.0.0/16'

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
    

    const proxyIP1 = '0.0.0.0/32'
    const proxyIP2 = '0.0.0.0/32'

    const pubSecurityGroup = new ec2.SecurityGroup(this, 'PubSG', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'PubSG'
    });
    
    
    // Ingress Rule
    pubSecurityGroup.addIngressRule(ec2.Peer.ipv4(proxyIP1), ec2.Port.allTraffic());
    pubSecurityGroup.addIngressRule(ec2.Peer.ipv4(proxyIP2), ec2.Port.allTraffic());
    
    ////////////////// ////////////////// ////////////////// 
   
    ////////////////// Public Security Group ////////////////// 
    
    const privateSecurityGroup = new ec2.SecurityGroup(this, 'PrivateSG', {
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'PrivateSG',
    });
    
    // Ingress Rule
    privateSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpcCidr), ec2.Port.allTraffic());
    
    ////////////////// ////////////////// ////////////////// 
   
   
   
   
   
   
    
  }
}
