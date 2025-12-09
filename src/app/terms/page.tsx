import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center text-foreground bg-gray-50/50">
        <header className="w-full border-b border-white/20 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <h1 className="text-2xl font-bold text-gray-800">Terms & Conditions</h1>
                <Button asChild variant="ghost">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to App
                    </Link>
                </Button>
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-8 flex-1">
            <Card className="w-full max-w-4xl mx-auto shadow-lg bg-white/90">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">Terms & Conditions for SkinWise</CardTitle>
                    <p className="text-sm text-muted-foreground">Last Updated: 09-12-2025</p>
                </CardHeader>
                <CardContent className="prose prose-zinc max-w-none dark:prose-invert">
                    <p>Welcome to SkinWise (“we”, “our”, “the platform”, or “the service”). By accessing or using SkinWise, you (“user”, “you”, or “your”) agree to the following Terms & Conditions. Please read them carefully before proceeding. If you do not agree to any part of these Terms, you must discontinue using the service immediately.</p>

                    <h2>1. Nature of the Service</h2>
                    <p>1.1 SkinWise is an AI-powered skin image analysis tool designed to provide general informational insights based on the images you upload.</p>
                    <p>1.2 The service uses machine learning models, and any results generated are automated predictions, not verified by any certified medical professional.</p>
                    <p>1.3 SkinWise does NOT provide medical advice, diagnosis, treatment, prescriptions, or professional medical services of any kind.</p>

                    <h2>2. No Medical Advice Disclaimer</h2>
                    <p>2.1 All information provided by SkinWise—including disease likelihoods, possible conditions, and suggested remedies—is for informational and educational purposes only.</p>
                    <p>2.2 The AI results must not be considered a medical diagnosis.</p>
                    <p>2.3 You should always consult a licensed dermatologist, doctor, or medical professional for any concerns related to your skin, health, or well-being.</p>
                    <p>2.4 You understand that SkinWise does not hold any medical certifications, licenses, or permits, and is not legally authorized to practice medicine.</p>

                    <h2>3. User Responsibilities</h2>
                    <p>3.1 You agree that you are solely responsible for how you use the information provided by the platform.</p>
                    <p>3.2 You acknowledge that uploading images and relying on AI predictions is entirely at your own risk.</p>
                    <p>3.3 You agree that you will not use the service as a replacement for professional medical advice or for emergency situations.</p>
                    <p>3.4 You confirm that you are at least 18 years old or have parental/guardian consent to use the service.</p>

                    <h2>4. Accuracy and Limitations of AI</h2>
                    <p>4.1 AI technology may sometimes provide incorrect, incomplete, or misleading information.</p>
                    <p>4.2 Factors such as lighting, image quality, angle, skin tone, and camera resolution may affect analysis results.</p>
                    <p>4.3 SkinWise makes no guarantees regarding the accuracy, reliability, completeness, or timeliness of AI-generated results.</p>
                    <p>4.4 The AI may fail to identify serious conditions, including but not limited to infections, skin cancers, allergic reactions, or chronic medical issues.</p>
                    <p>4.5 You accept that the AI might suggest conditions that are not applicable to you.</p>

                    <h2>5. Limitation of Liability</h2>
                    <p>5.1 SkinWise, its owners, developers, team members, and affiliates are not liable for:</p>
                    <ul>
                        <li>Any personal injury,</li>
                        <li>Missed or delayed diagnosis,</li>
                        <li>Emotional distress,</li>
                        <li>Loss of health,</li>
                        <li>Medical complications,</li>
                        <li>Financial loss,</li>
                        <li>Misinterpretation of AI results.</li>
                    </ul>
                    <p>5.2 By using the service, you agree that SkinWise is not responsible for any decisions you make after receiving AI-generated information.</p>
                    <p>5.3 Under no circumstances will SkinWise be liable for any direct, indirect, incidental, special, or consequential damages arising out of your use of the platform.</p>

                    <h2>6. Not a Substitute for Professional Care</h2>
                    <p>6.1 Always consult a doctor for:</p>
                    <ul>
                        <li>Persistent symptoms</li>
                        <li>Emergency conditions</li>
                        <li>Skin infections</li>
                        <li>Suspicious moles</li>
                        <li>Severe allergies</li>
                        <li>Rash spreading</li>
                        <li>Pain, bleeding, fever, or inflammation</li>
                    </ul>
                    <p>6.2 If you think you may have a medical emergency, contact your nearest hospital or emergency services immediately.</p>

                    <h2>7. User Data & Privacy</h2>
                    <p>7.1 SkinWise may collect and process uploaded skin images solely for analysis and service improvement.</p>
                    <p>7.2 Your images may be stored temporarily or permanently depending on system requirements.</p>
                    <p>7.3 We do not sell your images or personal data to third parties for marketing purposes.</p>
                    <p>7.4 By uploading images, you grant SkinWise permission to use them for:</p>
                    <ul>
                        <li>AI processing</li>
                        <li>Model improvement</li>
                        <li>Research and analysis (non-identifiable)</li>
                    </ul>
                    <p>7.5 You are responsible for ensuring that uploaded images belong to you or that you have permission to upload them.</p>

                    <h2>8. User Conduct</h2>
                    <p>You agree that you will not:</p>
                    <ul>
                        <li>Upload images of others without consent,</li>
                        <li>Upload explicit, abusive, or inappropriate content,</li>
                        <li>Use the service for unlawful or harmful purposes,</li>
                        <li>Attempt to reverse-engineer the platform.</li>
                    </ul>

                    <h2>9. Service Changes and Updates</h2>
                    <p>9.1 SkinWise may modify, update, suspend, or discontinue parts of or the entire service at any time without prior notice.</p>
                    <p>9.2 Continued use after changes means you accept the updated Terms.</p>

                    <h2>10. Termination of Use</h2>
                    <p>We reserve the right to suspend or terminate access to the service if we detect misuse, violation of policies, unauthorized activity, or any harmful behavior.</p>

                    <h2>11. No Guarantee of Availability</h2>
                    <p>11.1 SkinWise does not guarantee continuous, uninterrupted access to the platform.</p>
                    <p>11.2 Technical issues, upgrades, or external factors may cause service downtime.</p>

                    <h2>12. Consent</h2>
                    <p>By checking the “I Agree” box or using SkinWise, you confirm that:</p>
                    <ul>
                        <li>You fully understand the nature of the service,</li>
                        <li>You accept that this is an AI tool, not a medical service,</li>
                        <li>You voluntarily assume all risks associated with the use of the platform.</li>
                    </ul>

                    <h2>13. Governing Law</h2>
                    <p>These Terms & Conditions are governed by the laws of India, without regard to conflict of law principles.</p>
                </CardContent>
            </Card>
        </main>
         <footer className="w-full py-6">
            <div className="container mx-auto px-4 text-center text-sm text-gray-700">
                <p>&copy; {new Date().getFullYear()} SkinWise. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
}
