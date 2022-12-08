# Token---notification
To use this contract, you would first need to deploy it to the Ethereum blockchain.
Once it is deployed, you can call the updatePrice function to update the price of the token. 
Whenever the price changes, the PriceChanged event will be triggered, and you can use this event to send a notification to yourself.
You can also modify this code to suit your specific needs.
For example, you can add additional conditions to the updatePrice function to only send a notification when the price increases or decreases by a certain amount.
