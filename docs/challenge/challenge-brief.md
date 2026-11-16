# **Build a decision-making dashboard**

## **The challenge**

Most growing businesses don't have a data problem. They have a decision problem.

The data exists, but it's spread across billing tools, product databases and spreadsheets. Answering a simple question like "why are clients leaving?" or "which customers are actually worth it?" means pulling numbers from several places, lining them up by hand, and arguing about what they mean. By the time there's an answer, it's often too late to act on it, or the decision has already been made on gut feel.

That costs the business: decisions are slow, problems are spotted late, effort goes to the wrong places, and the same questions get re-investigated every few weeks.

Your challenge is to fix that.

You'll get data from two sources for a subscription business that serves trade businesses (plumbers, electricians, landscapers and so on): a billing system and a product database. Turn it into one dashboard that makes decisions faster and better. Someone should be able to open it, understand what's happening within a minute, and know what to do next.

We've listed what the dashboard needs to show. How you define each metric, how you display it, and how you make the important things stand out is up to you. That's where we'll see how you think.

##

## **Overview**

- Time: **4 Hours** \- Take this amount of time, no less; if you’re capable of completing it more efficiently, use the extra time to improve and iterate. Then, note this in your breakdown.
- Pay: \$50usd \- You're paid for this whether or not we hire you.
- AI: Highly encouraged, but used for efficiency rather than decision making. You should be able to explain every decision without it.
- Stack: Next.js and TypeScript, with a backend and a database (Postgres or similar). A plain UI is fine; clarity matters more than polish. UI components are encouraged if you are familiar with a template stack.

### **The data**

We'll provide an API with two parts:

- Billing (Stripe-style): customers, subscriptions, invoices, cancellations, failed payments, and add-on subscriptions.
- Product data: each client's trade, onboarding status and dates, go-live date, monthly leads, support tickets, last login, and whether they use the ads add-on.

The data is messy and incomplete in places, and some groups are very small. Handling that well is part of the task.

## **What the dashboard needs to show**

### **1\. Who should we call this week?**

A ranked list of clients at risk of leaving, based on a health score. Signals to consider: zero leads recently, a failed payment, falling leads, a spike in support tickets, being stuck in onboarding, or not logging in.

You decide how the signals combine, what thresholds to use, and how to explain why each client is on the list.

### **2\. Which clients are we keeping, and which are we losing?**

Overall retention, and when clients leave: in months 1–3, 4–6, or after 6 months. Early cancellations usually point to onboarding or expectations; later ones usually point to results.

### **3\. Do some types of clients get better results than others?**

Leads per client per month, by trade. This is the main proof that the product works. Show clearly whether there's enough data to trust each comparison.

### **4\. Which trades are the best business?**

- Revenue per client by trade
- Lifetime value by trade (average monthly revenue × average months retained)

A trade that pays less but stays three times longer may be the better business. Make that easy to see.

### **5\. Is the ads add-on worth pushing?**

How many clients take the ads add-on, and how retention compares for clients with and without it. Does it help clients stay, or do they leave because of the extra cost?

## **Bonus: take it further**

Once the required views are in place, find one more thing in the data that would change a decision, and build it.

We're deliberately not saying what. It could be a pattern we didn't ask about, a better way to present one of the views above, a prediction, an alert, or a different way of thinking about the problem. One well-reasoned addition beats several shallow ones.

Only start the bonus once the required views work. A strong bonus doesn't make up for missing core views.

## **What to deliver**

By the end of the 4 hours, send us a repo link that covers everything below.

- Connected to the API: billing and product data are joined, using live data rather than hardcoded values.
- A working backend: joining and calculations happen on the server, so the frontend gets data ready to display.
- A clear dashboard: one page with a clear visual hierarchy, so the things that need action are seen first. No auth or extra pages needed.
- All five required views: at-risk list, retention and timing, leads by trade, revenue and lifetime value by trade, and ads add-on impact.
- Well-defined metrics: you've decided exactly how each one is calculated (for example, what counts as "falling leads" or how to handle clients with no trade set).
- Bonus feature implemented.
- Setup instructions: how to run it against the API.
- A write-up covering your thought process behind implementation & how you believe the outcome is the most optimised approach. Also include an explanation as to your implementation of the bonus feature.
