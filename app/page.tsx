"use client";

import { useReceipt } from "@/context/ReceiptContext";
import StepIndicator from "./components/StepIndicator";
import ReceiptUpload from "./components/ReceiptUpload";
import OCRProcessor from "./components/OCRProcessor";
import ItemEditor from "./components/ItemEditor";
import PeopleManager from "./components/PeopleManager";
import ItemAssignment from "./components/ItemAssignment";
import BillSummary from "./components/BillSummary";

export default function Home() {
  const { currentStep } = useReceipt();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ReceiptUpload />;
      case 2:
        return <OCRProcessor />;
      case 3:
        return <ItemEditor />;
      case 4:
        return <PeopleManager />;
      case 5:
        return <ItemAssignment />;
      case 6:
        return <BillSummary />;
      default:
        return <ReceiptUpload />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Receipt Splitter</h1>
            <p className="text-muted-foreground">
              Split restaurant bills fairly and easily
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={6} />

          {/* Current Step Content */}
          <div className="mt-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
