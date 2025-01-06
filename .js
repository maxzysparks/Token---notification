// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract TokenNotifier is Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _trackedTokens;

    mapping(address => uint256) private _tokenPrices;
    mapping(address => bool) private _authorizedUpdaters;

    uint256 private _maxPrice;
    uint256 private _minPrice;
    uint256 public constant MAX_BATCH_SIZE = 100;
    uint8 public constant PRICE_DECIMALS = 18;
    uint256 public constant ABSOLUTE_MAX_PRICE = type(uint256).max;
    

    event PriceChanged(
        address indexed token,
        uint256 oldPrice,
        uint256 newPrice,
        address indexed updater,
        uint256 timestamp
    );

    event UpdaterStatusChanged(
        address indexed updater,
        bool status,
        address indexed changedBy,
        uint256 timestamp
    );

    event TokenStatusChanged(
        address indexed token,
        bool tracked,
        address indexed changedBy,
        uint256 timestamp
    );

    event PriceBoundsChanged(
        uint256 oldMinPrice,
        uint256 newMinPrice,
        uint256 oldMaxPrice,
        uint256 newMaxPrice,
        uint256 timestamp
    );

    error TokenNotifier__InvalidToken();
    error TokenNotifier__InvalidPrice(uint256 price, uint256 minAllowed, uint256 maxAllowed);
    error TokenNotifier__UnauthorizedUpdater(address updater);
    error TokenNotifier__TokenNotFound(address token);
    error TokenNotifier__TokenAlreadyTracked(address token);
    error TokenNotifier__ZeroAddress();
    error TokenNotifier__InvalidPriceRange();
    error TokenNotifier__BatchLimitExceeded(uint256 provided, uint256 maximum);
    error TokenNotifier__ArrayLengthMismatch(uint256 tokensLength, uint256 pricesLength);

    constructor(
        uint256 initialMaxPrice,
        uint256 initialMinPrice
    ) {
        if (initialMaxPrice <= initialMinPrice || initialMaxPrice > ABSOLUTE_MAX_PRICE) {
            revert TokenNotifier__InvalidPriceRange();
        }
        
        _maxPrice = initialMaxPrice;
        _minPrice = initialMinPrice;
        _authorizedUpdaters[msg.sender] = true;

        emit UpdaterStatusChanged(
            msg.sender,
            true,
            address(0),
            block.timestamp
        );
    }

    modifier validToken(address token) {
        if (token == address(0)) {
            revert TokenNotifier__ZeroAddress();
        }
        _;
    }

    modifier validPrice(uint256 price) {
        if (price < _minPrice || price > _maxPrice) {
            revert TokenNotifier__InvalidPrice(price, _minPrice, _maxPrice);
        }
        _;
    }

    modifier onlyAuthorized() {
        if (!_authorizedUpdaters[msg.sender]) {
            revert TokenNotifier__UnauthorizedUpdater(msg.sender);
        }
        _;
    }

    function updatePrice(
        address token,
        uint256 newPrice
    )
        external
        whenNotPaused
        nonReentrant
        validToken(token)
        validPrice(newPrice)
        onlyAuthorized
    {
        _updateSinglePrice(token, newPrice);
    }

    function updateBatchPrices(
        address[] calldata tokens,
        uint256[] calldata prices
    )
        external
        whenNotPaused
        nonReentrant
        onlyAuthorized
    {
        uint256 length = tokens.length;
        
        if (length > MAX_BATCH_SIZE) {
            revert TokenNotifier__BatchLimitExceeded(length, MAX_BATCH_SIZE);
        }
        
        if (length != prices.length) {
            revert TokenNotifier__ArrayLengthMismatch(length, prices.length);
        }

        for (uint256 i = 0; i < length;) {
            address token = tokens[i];
            uint256 price = prices[i];
            
            if (token == address(0)) {
                revert TokenNotifier__ZeroAddress();
            }
            if (price < _minPrice || price > _maxPrice) {
                revert TokenNotifier__InvalidPrice(price, _minPrice, _maxPrice);
            }
            
            _updateSinglePrice(token, price);
            
            unchecked {
                ++i;
            }
        }
    }

    function setUpdaterStatus(
        address updater,
        bool status
    )
        external
        onlyOwner
        validToken(updater)
    {
        _authorizedUpdaters[updater] = status;
        
        emit UpdaterStatusChanged(
            updater,
            status,
            msg.sender,
            block.timestamp
        );
    }

    function updatePriceBounds(
        uint256 newMaxPrice,
        uint256 newMinPrice
    )
        external
        onlyOwner
    {
        if (newMaxPrice <= newMinPrice || newMaxPrice > ABSOLUTE_MAX_PRICE) {
            revert TokenNotifier__InvalidPriceRange();
        }

        uint256 oldMaxPrice = _maxPrice;
        uint256 oldMinPrice = _minPrice;
        
        _maxPrice = newMaxPrice;
        _minPrice = newMinPrice;

        emit PriceBoundsChanged(
            oldMinPrice,
            newMinPrice,
            oldMaxPrice,
            newMaxPrice,
            block.timestamp
        );
    }


    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _updateSinglePrice(
        address token,
        uint256 newPrice
    )
        private
    {
        uint256 oldPrice = _tokenPrices[token];
        _tokenPrices[token] = newPrice;

        // Add to tracked tokens if not already tracked
        if (_trackedTokens.add(token)) {
            emit TokenStatusChanged(
                token,
                true,
                msg.sender,
                block.timestamp
            );
        }

        emit PriceChanged(
            token,
            oldPrice,
            newPrice,
            msg.sender,
            block.timestamp
        );
    }

    function getPrice(
        address token
    )
        external
        view
        returns (uint256)
    {
        return _tokenPrices[token];
    }

    function getBatchPrices(
        address[] calldata tokens
    )
        external
        view
        returns (uint256[] memory prices)
    {
        uint256 length = tokens.length;
        if (length > MAX_BATCH_SIZE) {
            revert TokenNotifier__BatchLimitExceeded(length, MAX_BATCH_SIZE);
        }

        prices = new uint256[](length);
        for (uint256 i = 0; i < length;) {
            prices[i] = _tokenPrices[tokens[i]];
            unchecked {
                ++i;
            }
        }
    }

    function getTrackedTokens()
        external
        view
        returns (address[] memory)
    {
        return _trackedTokens.values();
    }

    function isAuthorizedUpdater(
        address updater
    )
        external
        view
        returns (bool)
    {
        return _authorizedUpdaters[updater];
    }

    function getPriceBounds()
        external
        view
        returns (uint256 minPrice, uint256 maxPrice)
    {
        return (_minPrice, _maxPrice);
    }
}