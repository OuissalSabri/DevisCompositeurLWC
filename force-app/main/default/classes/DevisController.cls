public with sharing class DevisController {

    @AuraEnabled(cacheable=true)
    public static List<Quote> fetchNoSendRecords(Id currentRecordId){
        try {
            return [SELECT Id, Name FROM Quote WHERE OpportunityId = :currentRecordId AND Status = 'Draft'];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<QuoteLineItem> getRelatedQuotesItems(Id quoteId){
        try {
            return [SELECT Id, Product2.Name, ListPrice , Discount , Quantity, UnitPrice, TotalPrice, Subtotal FROM QuoteLineItem WHERE QuoteId = :quoteId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateQuoteLineItems(List<QuoteLineItem> quoteLineItems) {
        try {
            update quoteLineItems;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating Quote Line Items: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts() {
        try {
            return [SELECT Id, Name FROM Product2];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
public static void addQuoteLineItem(Id quoteId, Id productId, Decimal discount, Decimal quantity, Decimal unitPrice) {
    try {
        
        Id pricebookId = [SELECT Pricebook2Id FROM Quote WHERE Id = :quoteId].Pricebook2Id;
        
       
        PricebookEntry pbe = [SELECT Id 
                              FROM PricebookEntry 
                              WHERE Product2Id = :productId 
                              AND Pricebook2Id = :pricebookId 
                              LIMIT 1];
        
        if(pbe != null) {
          
            QuoteLineItem newQuoteLineItem = new QuoteLineItem();
            newQuoteLineItem.QuoteId = quoteId;
            newQuoteLineItem.PricebookEntryId = pbe.Id;
            newQuoteLineItem.Discount = discount;
            newQuoteLineItem.Quantity = quantity;
            newQuoteLineItem.UnitPrice = unitPrice;
            
            
            insert newQuoteLineItem;
        } else {
            throw new AuraHandledException('Error adding Quote Line Item: Pricebook Entry not found.');
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error adding Quote Line Item: ' + e.getMessage());
    }
}    


@AuraEnabled(cacheable=true)
    public static Decimal getProductSalesPrice(Id productId, Id quoteId) {
        try {
            Id pricebookId = [SELECT Pricebook2Id FROM Quote WHERE Id = :quoteId].Pricebook2Id;
            
            PricebookEntry pbe = [SELECT UnitPrice FROM PricebookEntry 
                                  WHERE Product2Id = :productId 
                                  AND Pricebook2Id = :pricebookId 
                                  LIMIT 1];
            return pbe.UnitPrice;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
public static void deleteQuoteLineItem(Id quoteLineItemId) {
    try {
       
        QuoteLineItem quoteLineItem = [SELECT Id FROM QuoteLineItem WHERE Id = :quoteLineItemId LIMIT 1];
        
       
        if (quoteLineItem != null) {
           
            delete quoteLineItem;
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error deleting Quote Line Item: ' + e.getMessage());
    }
}
@AuraEnabled
public static Id cloneQuoteLineItem(Id quoteLineItemId) {
    Id clonedQuoteLineItemId;
    try {
        
        QuoteLineItem quoteLineItemToClone = [SELECT Id, Product2Id, Discount, Quantity, UnitPrice, QuoteId, PricebookEntryId
                                              FROM QuoteLineItem 
                                              WHERE Id = :quoteLineItemId LIMIT 1];

        if (quoteLineItemToClone != null) {
           
            QuoteLineItem clonedQuoteLineItem = quoteLineItemToClone.clone(false, false, false, false);
            clonedQuoteLineItem.QuoteId = quoteLineItemToClone.QuoteId;
            clonedQuoteLineItem.PricebookEntryId = quoteLineItemToClone.PricebookEntryId;
            
           
            insert clonedQuoteLineItem;
            clonedQuoteLineItemId = clonedQuoteLineItem.Id;
        }
    } catch (Exception e) {
        throw new AuraHandledException('Error cloning Quote Line Item: ' + e.getMessage());
    }
    return clonedQuoteLineItemId;
}


}
