//SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract TokenNotifier {
  // Declare a mapping to store the current price of the token
  mapping (address => uint256) public tokenPrices;

  // Declare an event that will be triggered when the price changes
  event PriceChanged(address token, uint256 oldPrice, uint256 newPrice);

  // Function to update the price of the token
  function updatePrice(address token, uint256 newPrice) public {
    // Get the current price of the token
    uint256 oldPrice = tokenPrices[token];

    // Check if the new price is different from the old price
    if (oldPrice != newPrice) {
      // Update the token price
      tokenPrices[token] = newPrice;

      // Trigger the PriceChanged event
      emit PriceChanged(token, oldPrice, newPrice);
    }
  }
}
