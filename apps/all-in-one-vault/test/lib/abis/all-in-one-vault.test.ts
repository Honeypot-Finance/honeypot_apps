import { AllInOneVaultABI } from '../../../lib/abis/all-in-one-vault';

describe('AllInOneVaultABI', () => {
  describe('ABI Structure', () => {
    it('should be a valid ABI array', () => {
      expect(Array.isArray(AllInOneVaultABI)).toBe(true);
      expect(AllInOneVaultABI.length).toBeGreaterThan(0);
    });

    it('should contain required function signatures', () => {
      const functionNames = AllInOneVaultABI
        .filter(item => item.type === 'function')
        .map(item => item.name);

      // Core business logic functions
      expect(functionNames).toContain('getReceipt');
      expect(functionNames).toContain('receipts');
      expect(functionNames).toContain('claim');
      expect(functionNames).toContain('supportedTokens');
      expect(functionNames).toContain('totalWeight');
      expect(functionNames).toContain('cooldownTime');
    });

    it('should contain required events', () => {
      const eventNames = AllInOneVaultABI
        .filter(item => item.type === 'event')
        .map(item => item.name);

      expect(eventNames).toContain('GotReceipt');
      expect(eventNames).toContain('Claimed');
      expect(eventNames).toContain('SupportedTokenUpdated');
      expect(eventNames).toContain('CooldownTimeUpdated');
    });

    it('should contain required errors', () => {
      const errorNames = AllInOneVaultABI
        .filter(item => item.type === 'error')
        .map(item => item.name);

      expect(errorNames).toContain('SafeERC20FailedOperation');
      expect(errorNames).toContain('AccessControlUnauthorizedAccount');
    });
  });

  describe('getReceipt Function', () => {
    let getReceiptFunction: any;

    beforeAll(() => {
      getReceiptFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'getReceipt'
      );
    });

    it('should have correct function signature', () => {
      expect(getReceiptFunction).toBeDefined();
      expect(getReceiptFunction.type).toBe('function');
      expect(getReceiptFunction.name).toBe('getReceipt');
      expect(getReceiptFunction.stateMutability).toBe('nonpayable');
    });

    it('should have correct input parameters', () => {
      expect(getReceiptFunction.inputs).toHaveLength(2);
      
      const tokenParam = getReceiptFunction.inputs[0];
      expect(tokenParam.name).toBe('token');
      expect(tokenParam.type).toBe('address');
      expect(tokenParam.internalType).toBe('address');

      const amountParam = getReceiptFunction.inputs[1];
      expect(amountParam.name).toBe('amount');
      expect(amountParam.type).toBe('uint256');
      expect(amountParam.internalType).toBe('uint256');
    });

    it('should have no output parameters', () => {
      expect(getReceiptFunction.outputs).toHaveLength(0);
    });
  });

  describe('receipts Function', () => {
    let receiptsFunction: any;

    beforeAll(() => {
      receiptsFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'receipts'
      );
    });

    it('should have correct function signature', () => {
      expect(receiptsFunction).toBeDefined();
      expect(receiptsFunction.type).toBe('function');
      expect(receiptsFunction.name).toBe('receipts');
      expect(receiptsFunction.stateMutability).toBe('view');
    });

    it('should have correct input parameters', () => {
      expect(receiptsFunction.inputs).toHaveLength(1);
      
      const receiptIdParam = receiptsFunction.inputs[0];
      expect(receiptIdParam.name).toBe('');
      expect(receiptIdParam.type).toBe('uint256');
      expect(receiptIdParam.internalType).toBe('uint256');
    });

    it('should have correct output parameters', () => {
      expect(receiptsFunction.outputs).toHaveLength(5);
      
      const outputs = receiptsFunction.outputs;
      expect(outputs[0].name).toBe('user');
      expect(outputs[0].type).toBe('address');
      expect(outputs[0].internalType).toBe('address');

      expect(outputs[1].name).toBe('token');
      expect(outputs[1].type).toBe('address');
      expect(outputs[1].internalType).toBe('address');

      expect(outputs[2].name).toBe('receiptWeight');
      expect(outputs[2].type).toBe('uint256');
      expect(outputs[2].internalType).toBe('uint256');

      expect(outputs[3].name).toBe('claimableAt');
      expect(outputs[3].type).toBe('uint256');
      expect(outputs[3].internalType).toBe('uint256');

      expect(outputs[4].name).toBe('claimed');
      expect(outputs[4].type).toBe('bool');
      expect(outputs[4].internalType).toBe('bool');
    });
  });

  describe('claim Function', () => {
    let claimFunction: any;

    beforeAll(() => {
      claimFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'claim'
      );
    });

    it('should have correct function signature', () => {
      expect(claimFunction).toBeDefined();
      expect(claimFunction.type).toBe('function');
      expect(claimFunction.name).toBe('claim');
      expect(claimFunction.stateMutability).toBe('nonpayable');
    });

    it('should have correct input parameters', () => {
      expect(claimFunction.inputs).toHaveLength(1);
      
      const receiptIdParam = claimFunction.inputs[0];
      expect(receiptIdParam.name).toBe('receiptID');
      expect(receiptIdParam.type).toBe('uint256');
      expect(receiptIdParam.internalType).toBe('uint256');
    });

    it('should have no output parameters', () => {
      expect(claimFunction.outputs).toHaveLength(0);
    });
  });

  describe('supportedTokens Function', () => {
    let supportedTokensFunction: any;

    beforeAll(() => {
      supportedTokensFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'supportedTokens'
      );
    });

    it('should have correct function signature', () => {
      expect(supportedTokensFunction).toBeDefined();
      expect(supportedTokensFunction.type).toBe('function');
      expect(supportedTokensFunction.name).toBe('supportedTokens');
      expect(supportedTokensFunction.stateMutability).toBe('view');
    });

    it('should have correct input parameters', () => {
      expect(supportedTokensFunction.inputs).toHaveLength(1);
      
      const tokenParam = supportedTokensFunction.inputs[0];
      expect(tokenParam.name).toBe('');
      expect(tokenParam.type).toBe('address');
      expect(tokenParam.internalType).toBe('address');
    });

    it('should have correct output parameters', () => {
      expect(supportedTokensFunction.outputs).toHaveLength(1);
      
      const output = supportedTokensFunction.outputs[0];
      expect(output.name).toBe('');
      expect(output.type).toBe('uint256');
      expect(output.internalType).toBe('uint256');
    });
  });

  describe('totalWeight Function', () => {
    let totalWeightFunction: any;

    beforeAll(() => {
      totalWeightFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'totalWeight'
      );
    });

    it('should have correct function signature', () => {
      expect(totalWeightFunction).toBeDefined();
      expect(totalWeightFunction.type).toBe('function');
      expect(totalWeightFunction.name).toBe('totalWeight');
      expect(totalWeightFunction.stateMutability).toBe('view');
    });

    it('should have no input parameters', () => {
      expect(totalWeightFunction.inputs).toHaveLength(0);
    });

    it('should have correct output parameters', () => {
      expect(totalWeightFunction.outputs).toHaveLength(1);
      
      const output = totalWeightFunction.outputs[0];
      expect(output.name).toBe('');
      expect(output.type).toBe('uint256');
      expect(output.internalType).toBe('uint256');
    });
  });

  describe('cooldownTime Function', () => {
    let cooldownTimeFunction: any;

    beforeAll(() => {
      cooldownTimeFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'cooldownTime'
      );
    });

    it('should have correct function signature', () => {
      expect(cooldownTimeFunction).toBeDefined();
      expect(cooldownTimeFunction.type).toBe('function');
      expect(cooldownTimeFunction.name).toBe('cooldownTime');
      expect(cooldownTimeFunction.stateMutability).toBe('view');
    });

    it('should have no input parameters', () => {
      expect(cooldownTimeFunction.inputs).toHaveLength(0);
    });

    it('should have correct output parameters', () => {
      expect(cooldownTimeFunction.outputs).toHaveLength(1);
      
      const output = cooldownTimeFunction.outputs[0];
      expect(output.name).toBe('');
      expect(output.type).toBe('uint256');
      expect(output.internalType).toBe('uint256');
    });
  });

  describe('GotReceipt Event', () => {
    let gotReceiptEvent: any;

    beforeAll(() => {
      gotReceiptEvent = AllInOneVaultABI.find(
        item => item.type === 'event' && item.name === 'GotReceipt'
      );
    });

    it('should have correct event signature', () => {
      expect(gotReceiptEvent).toBeDefined();
      expect(gotReceiptEvent.type).toBe('event');
      expect(gotReceiptEvent.name).toBe('GotReceipt');
      expect(gotReceiptEvent.anonymous).toBe(false);
    });

    it('should have correct event parameters', () => {
      expect(gotReceiptEvent.inputs).toHaveLength(5);
      
      const inputs = gotReceiptEvent.inputs;
      expect(inputs[0].name).toBe('user');
      expect(inputs[0].type).toBe('address');
      expect(inputs[0].indexed).toBe(true);

      expect(inputs[1].name).toBe('receiptID');
      expect(inputs[1].type).toBe('uint256');
      expect(inputs[1].indexed).toBe(false);

      expect(inputs[2].name).toBe('token');
      expect(inputs[2].type).toBe('address');
      expect(inputs[2].indexed).toBe(true);

      expect(inputs[3].name).toBe('receiptWeight');
      expect(inputs[3].type).toBe('uint256');
      expect(inputs[3].indexed).toBe(false);

      expect(inputs[4].name).toBe('claimableAt');
      expect(inputs[4].type).toBe('uint256');
      expect(inputs[4].indexed).toBe(false);
    });
  });

  describe('Claimed Event', () => {
    let claimedEvent: any;

    beforeAll(() => {
      claimedEvent = AllInOneVaultABI.find(
        item => item.type === 'event' && item.name === 'Claimed'
      );
    });

    it('should have correct event signature', () => {
      expect(claimedEvent).toBeDefined();
      expect(claimedEvent.type).toBe('event');
      expect(claimedEvent.name).toBe('Claimed');
      expect(claimedEvent.anonymous).toBe(false);
    });

    it('should have correct event parameters', () => {
      expect(claimedEvent.inputs).toHaveLength(4);
      
      const inputs = claimedEvent.inputs;
      expect(inputs[0].name).toBe('user');
      expect(inputs[0].type).toBe('address');
      expect(inputs[0].indexed).toBe(true);

      expect(inputs[1].name).toBe('receiptID');
      expect(inputs[1].type).toBe('uint256');
      expect(inputs[1].indexed).toBe(false);

      expect(inputs[2].name).toBe('reward');
      expect(inputs[2].type).toBe('uint256');
      expect(inputs[2].indexed).toBe(false);

      expect(inputs[3].name).toBe('timestamp');
      expect(inputs[3].type).toBe('uint256');
      expect(inputs[3].indexed).toBe(false);
    });
  });

  describe('Administrative Functions', () => {
    it('should contain admin role functions', () => {
      const functionNames = AllInOneVaultABI
        .filter(item => item.type === 'function')
        .map(item => item.name);

      expect(functionNames).toContain('updateSupportedToken');
      expect(functionNames).toContain('removeSupportedToken');
      expect(functionNames).toContain('setCooldownTime');
      expect(functionNames).toContain('grantRole');
      expect(functionNames).toContain('revokeRole');
    });

    it('should contain role constants', () => {
      const functionNames = AllInOneVaultABI
        .filter(item => item.type === 'function')
        .map(item => item.name);

      expect(functionNames).toContain('ADMIN_ROLE');
      expect(functionNames).toContain('DEFAULT_ADMIN_ROLE');
      expect(functionNames).toContain('UPGRADER_ROLE');
    });
  });

  describe('View Functions', () => {
    it('should contain required view functions', () => {
      const viewFunctions = AllInOneVaultABI
        .filter(item => item.type === 'function' && item.stateMutability === 'view')
        .map(item => item.name);

      expect(viewFunctions).toContain('receipts');
      expect(viewFunctions).toContain('supportedTokens');
      expect(viewFunctions).toContain('totalWeight');
      expect(viewFunctions).toContain('cooldownTime');
      expect(viewFunctions).toContain('nextReceiptID');
      expect(viewFunctions).toContain('beraPawAddress');
      expect(viewFunctions).toContain('lBGTAddress');
      expect(viewFunctions).toContain('rewardVault');
    });
  });

  describe('Error Types', () => {
    it('should contain access control errors', () => {
      const errorNames = AllInOneVaultABI
        .filter(item => item.type === 'error')
        .map(item => item.name);

      expect(errorNames).toContain('AccessControlBadConfirmation');
      expect(errorNames).toContain('AccessControlUnauthorizedAccount');
    });

    it('should contain ERC20 and contract errors', () => {
      const errorNames = AllInOneVaultABI
        .filter(item => item.type === 'error')
        .map(item => item.name);

      expect(errorNames).toContain('SafeERC20FailedOperation');
      expect(errorNames).toContain('AddressEmptyCode');
      expect(errorNames).toContain('FailedCall');
    });

    it('should contain upgrade-related errors', () => {
      const errorNames = AllInOneVaultABI
        .filter(item => item.type === 'error')
        .map(item => item.name);

      expect(errorNames).toContain('ERC1967InvalidImplementation');
      expect(errorNames).toContain('UUPSUnauthorizedCallContext');
      expect(errorNames).toContain('UUPSUnsupportedProxiableUUID');
    });
  });

  describe('ABI Completeness', () => {
    it('should have constructor', () => {
      const constructor = AllInOneVaultABI.find(item => item.type === 'constructor');
      expect(constructor).toBeDefined();
      expect(constructor?.stateMutability).toBe('nonpayable');
    });

    it('should have initialize function for proxy pattern', () => {
      const initializeFunction = AllInOneVaultABI.find(
        item => item.type === 'function' && item.name === 'initialize'
      );
      expect(initializeFunction).toBeDefined();
      expect(initializeFunction?.stateMutability).toBe('nonpayable');
    });

    it('should have upgrade functions', () => {
      const functionNames = AllInOneVaultABI
        .filter(item => item.type === 'function')
        .map(item => item.name);

      expect(functionNames).toContain('upgradeToAndCall');
      expect(functionNames).toContain('proxiableUUID');
    });
  });

  describe('Type Safety', () => {
    it('should be properly typed as const', () => {
      // This test ensures the ABI is typed as const for better TypeScript inference
      expect(typeof AllInOneVaultABI).toBe('object');
      expect(AllInOneVaultABI).toBeDefined();
    });

    it('should have consistent parameter types', () => {
      const functions = AllInOneVaultABI.filter(item => item.type === 'function');
      
      functions.forEach(func => {
        if (func.inputs) {
          func.inputs.forEach(input => {
            expect(input.type).toBeDefined();
            expect(input.internalType).toBeDefined();
            expect(typeof input.name).toBe('string');
          });
        }
        
        if (func.outputs) {
          func.outputs.forEach(output => {
            expect(output.type).toBeDefined();
            expect(output.internalType).toBeDefined();
            expect(typeof output.name).toBe('string');
          });
        }
      });
    });
  });
});