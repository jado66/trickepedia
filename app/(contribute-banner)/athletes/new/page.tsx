import { AthleteForm } from "@/components/athletes/athlete-form";

export default function NewAthletePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Add New Athlete</h1>
          <p className="text-muted-foreground mt-2">
            Create a profile for an amazing athlete in the action sports
            community
          </p>
        </div>

        <AthleteForm />
      </div>
    </div>
  );
}
