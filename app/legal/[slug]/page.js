import { notFound } from "next/navigation";
const PAGES = {
  privacy: { title: "Privacy Policy", body: [
    "AAYU EDITOR collects the details you enter when ordering or contacting us: name, email, WhatsApp number, project requirements and links you share. We use them only to deliver your order, contact you about it and send order and payment confirmations.",
    "Payments are processed by Razorpay. We never see or store your card, UPI or bank details. Razorpay handles them under its own privacy policy.",
    "Your data is stored with our database provider (Supabase) and order emails are sent through an email service provider. We do not sell your data. We share it only with these service providers to run the website, or when required by law.",
    "To ask for your data to be corrected or deleted, send us a message through the Contact page with your Order ID." ] },
  terms: { title: "Terms and Conditions", body: [
    "By placing an order on this website you agree to these terms. AAYU EDITOR provides video editing and graphic design services as described on the website.",
    "You confirm that you own or have permission to use all footage, music, images and other material you send us, and that it does not break any law or third-party rights.",
    "Delivery date is the preferred date you give in the order form and is confirmed with you on WhatsApp. Delays can happen if footage or information is incomplete.",
    "Prices shown are for the listed package. Custom work is quoted separately before you pay. Payment must be completed for packages with a listed price before work starts.",
    "We may show completed work in our portfolio unless you ask us in writing not to.",
    "These terms may be updated. The version on this page applies at the time of your order." ] },
  refund: { title: "Refund and Cancellation Policy", body: [
    "You can cancel an order and receive a full refund if you contact us before editing work has started. Message us through the Contact page or WhatsApp with your Order ID.",
    "Once editing has started, refunds are decided case by case based on how much work has been done. Digital work already delivered is not refundable, but we will fix reasonable corrections you request.",
    "If a payment was deducted but your order shows as unpaid, contact us with your Order ID and payment details. Duplicate or failed payments are refunded in full.",
    "Approved refunds are returned to the original payment method through Razorpay. The time it takes to reach your account depends on your bank or payment provider." ] },
};
export function generateStaticParams() { return Object.keys(PAGES).map((slug) => ({ slug })); }
export function generateMetadata({ params }) { const p = PAGES[params.slug]; return { title: p ? `${p.title} – AAYU EDITOR` : "Not found" }; }
export default function Legal({ params }) {
  const p = PAGES[params.slug]; if (!p) notFound();
  return (<><div className="bg" /><section style={{ maxWidth: 760 }}>
    <h2>{p.title}</h2>{p.body.map((t, i) => <p key={i} style={{ margin: "0 0 14px", opacity: .85 }}>{t}</p>)}
    <a className="btn" href="/">Back to home</a></section></>);
}
