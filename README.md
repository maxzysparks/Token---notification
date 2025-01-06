# TokenNotifier Smart Contract

## Overview
TokenNotifier is a robust Solidity smart contract designed for tracking and managing token prices on the blockchain. It features a comprehensive authorization system, price validation, batch operations, and emergency controls.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4.9.0-blue.svg)](https://openzeppelin.com/)

## Features

- **Price Management**
  - Single and batch token price updates
  - Configurable price boundaries
  - Historical price tracking through events

- **Access Control**
  - Role-based authorization system
  - Owner-controlled administrative functions
  - Updater management system

- **Security**
  - Reentrancy protection
  - Input validation
  - Emergency pause functionality
  - Gas optimization
  - Comprehensive error handling

- **Utility Functions**
  - Batch price queries
  - Token tracking
  - Price boundary management
  - Authorization checks

## Installation

```bash
npm install @openzeppelin/contracts
```

## Contract Details

### State Variables

- `_trackedTokens`: EnumerableSet of tracked token addresses
- `_tokenPrices`: Mapping of token addresses to their current prices
- `_authorizedUpdaters`: Mapping of addresses authorized to update prices
- `_maxPrice`: Maximum allowed price value
- `_minPrice`: Minimum allowed price value

### Constants

- `MAX_BATCH_SIZE`: Maximum number of tokens in batch operations (100)
- `PRICE_DECIMALS`: Decimal places for price values (18)
- `ABSOLUTE_MAX_PRICE`: Maximum possible price value

## Usage

### Deployment

Deploy the contract with initial price boundaries:

```solidity
constructor(
    uint256 initialMaxPrice,
    uint256 initialMinPrice
)
```

### Main Functions

1. Update Single Token Price
```solidity
function updatePrice(
    address token,
    uint256 newPrice
) external
```

2. Update Multiple Token Prices
```solidity
function updateBatchPrices(
    address[] calldata tokens,
    uint256[] calldata prices
) external
```

3. Manage Updaters
```solidity
function setUpdaterStatus(
    address updater,
    bool status
) external
```

4. Update Price Boundaries
```solidity
function updatePriceBounds(
    uint256 newMaxPrice,
    uint256 newMinPrice
) external
```

### View Functions

1. Get Single Token Price
```solidity
function getPrice(
    address token
) external view returns (uint256)
```

2. Get Multiple Token Prices
```solidity
function getBatchPrices(
    address[] calldata tokens
) external view returns (uint256[] memory)
```

3. Get All Tracked Tokens
```solidity
function getTrackedTokens() 
    external view returns (address[] memory)
```

## Events

- `PriceChanged`: Emitted when a token's price is updated
- `UpdaterStatusChanged`: Emitted when an updater's status changes
- `TokenStatusChanged`: Emitted when a token's tracking status changes
- `PriceBoundsChanged`: Emitted when price boundaries are updated

## Error Handling

Custom errors are used for efficient gas consumption and clear error messaging:

- `TokenNotifier__InvalidToken`
- `TokenNotifier__InvalidPrice`
- `TokenNotifier__UnauthorizedUpdater`
- `TokenNotifier__TokenNotFound`
- `TokenNotifier__TokenAlreadyTracked`
- `TokenNotifier__ZeroAddress`
- `TokenNotifier__InvalidPriceRange`
- `TokenNotifier__BatchLimitExceeded`
- `TokenNotifier__ArrayLengthMismatch`

## Security Considerations

1. Access Control
   - Only authorized updaters can modify prices
   - Owner-only administrative functions
   - Role-based access control

2. Input Validation
   - Price range validation
   - Address validation
   - Batch size limits

3. Protection Mechanisms
   - Reentrancy guards
   - Pausable functionality
   - SafeMath operations

## Gas Optimization

- Uses EnumerableSet for efficient token tracking
- Implements unchecked blocks for gas-efficient loops
- Optimized storage patterns
- Batch operations support

## Development

### Prerequisites

- Node.js >= 14.0.0
- Hardhat or Truffle
- OpenZeppelin Contracts

### Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/TokenNotifier.test.js
```

### Deployment

```bash
npx hardhat run scripts/deploy.js --network <network_name>
```

## Auditing

The contract has been designed with security best practices but should undergo a professional audit before production deployment.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- OpenZeppelin for secure contract components
- Ethereum community for best practices