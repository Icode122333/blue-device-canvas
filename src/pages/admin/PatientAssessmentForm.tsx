import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save, ClipboardList } from "lucide-react";

interface PatientProfile { user_id: string; role: string; username?: string | null }
interface AssessmentRow { id: string; patient_id: string; physio_id: string; created_at: string; full_name: string | null; rehab_recommendations: string | null }

const STEPS = [
  "Patient ID", "Perinatal", "Medical & CP", "Conditions I", "Conditions II", "Assistive & Dev", "Subj. Plan", // Subjective: 0-6
  "Observation", "Ashworth & ROM", "Strength & Rflx", "Balance & Sens.", "Mobility & ADL", "Pain & Class.", "Environment", "Rehab Plan" // Objective: 7-14
];

export default function PatientAssessmentForm() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [recent, setRecent] = useState<AssessmentRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const [d, setD] = useState({
    hospitalId: "", dateOfAssessment: new Date().toISOString().split("T")[0], assessedBy: "", age: "", sex: "",
    dob: "", homeAddress: "", caregiverName: "", caregiverContact: "",
    gestationalAge: "", maternalIllness: "", maternalMeds: "", placeOfDelivery: "", modeOfDelivery: "",
    apgarScore: "", birthComplications: "", nicuDuration: "", timeToCry: "", timeToSuck: "", headCircumference: "",
    pastMedicalHistory: "", presentMedicalHistory: "", cpType: "", cpDistribution: "",
    neuro: "", sensory: "", communication: "", feeding: "", msk: "",
    respiratory: "", behavioral: "", sleep: "", medications: "", surgeries: "",
    assistiveDevices: "", grossHeadControl: "", grossRolling: "", grossSitting: "", grossCrawling: "", grossStanding: "", grossWalking: "", grossComment: "",
    fineMotor: "", speech: "", precautions1: "", contraindications1: "", precautions2: "", contraindications2: "", recommendations: ""
  });

  const [o, setO] = useState({
    observation: "", supine: "", prone: "", sitting: "", standing: "",
    toneRUL: "", toneLUL: "", toneTrunk: "", toneRLL: "", toneLLL: "",
    ashworth: { shoulderR: "", shoulderL: "", elbowR: "", elbowL: "", wristR: "", wristL: "", hipAdR: "", hipAdL: "", kneeR: "", kneeL: "", plantarR: "", plantarL: "", fingersR: "", fingersL: "" },
    rom: { shoulderR: "", shoulderL: "", elbowR: "", elbowL: "", wristR: "", wristL: "", hipR: "", hipL: "", kneeR: "", kneeL: "", ankleR: "", ankleL: "" },
    contractures: "", contractureComment: "",
    strength: { neckR: "", neckL: "", trunkR: "", trunkL: "", shoulderR: "", shoulderL: "", elbowR: "", elbowL: "", wristR: "", wristL: "", hipR: "", hipL: "", kneeR: "", kneeL: "", ankleR: "", ankleL: "" },
    reflexDTR: { bicepsR: "", bicepsL: "", tricepsR: "", tricepsL: "", patellarR: "", patellarL: "", achillesR: "", achillesL: "" },
    primitiveReflexes: "", rightingReactions: "", protectiveReactions: "", protectiveStatus: "",
    sitBal: "", sitBalCom: "", standBal: "", standBalCom: "",
    coordNose: "", coordFinger: "", coordShin: "", coordCom: "",
    sensoryLight: "", sensoryLightCom: "", sensoryProp: "", sensoryPropCom: "", sensoryPain: "", sensoryPainCom: "",
    mobRolling: "", mobRollingCom: "", mobSitting: "", mobSittingCom: "", mobStanding: "", mobStandingCom: "", mobWalking: "", mobWalkingCom: "",
    tfSupine: "", tfSupineCom: "", tfSit: "", tfSitCom: "", tfBed: "", tfBedCom: "", tfFloor: "", tfFloorCom: "", tfToilet: "", tfToiletCom: "",
    adlFeeding: "", adlDressing: "", adlBathing: "", adlToileting: "",
    painPresent: "", painLocation: "", painScale: "", painNature: "", painAggravating: "", painRelieving: "",
    gmfcs: "", macs: "", cfcs: "",
    envSurfaces: "", envDoorLength: "", envDoorWidth: "", envDoorType: "", envLighting: "", envNoise: "", envToys: "", envAccessible: "",
    objContra: "", objPre: "", redFlags: "", yellowFlags: "",
    stg1: "", stg2: "", ltg1: "", ltg2: "",
    freq: "", referral: "", clinicalNotes: ""
  });

  const updateD = (field: keyof typeof d, value: string) => setD(prev => ({ ...prev, [field]: value }));
  const updateO = (field: keyof typeof o, value: any) => setO(prev => ({ ...prev, [field]: value }));

  // Helper for nested updates
  const updateNestedO = (parent: "ashworth" | "rom" | "strength" | "reflexDTR", field: string, value: string) => {
    setO(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  const loadPatients = async () => {
    const { data } = await supabase.from("profiles").select("user_id,role,username").eq("role", "patient");
    if (data) setPatients(data as PatientProfile[]);
  };

  const loadRecent = async () => {
    // @ts-ignore
    const { data } = await (supabase.from("patient_assessments") as any).select("id,patient_id,physio_id,created_at,full_name,rehab_recommendations").order("created_at", { ascending: false }).limit(5);
    if (data) setRecent(data as AssessmentRow[]);
  };

  useEffect(() => { loadPatients(); loadRecent(); }, []);

  const handleNext = () => { if (step < STEPS.length - 1) setStep(s => s + 1); };
  const handlePrev = () => { if (step > 0) setStep(s => s - 1); };

  const submit = async () => {
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) { toast({ title: "Not signed in", variant: "destructive" }); setSubmitting(false); return; }
    if (!selectedPatient) { toast({ title: "Select a patient", variant: "destructive" }); setSubmitting(false); return; }

    const payload = {
      patient_id: selectedPatient,
      physio_id: userData.user.id,
      full_name: patients.find(p => p.user_id === selectedPatient)?.username || "Unknown",
      functional_complaint: d.presentMedicalHistory,
      rehab_recommendations: d.recommendations + "\n" + o.clinicalNotes,
      subjective_assessment: d,
      objective_assessment: o
    };

    // @ts-ignore
    const { error } = await (supabase.from("patient_assessments") as any).insert(payload as any);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assessment saved successfully", className: "bg-emerald-900 text-white" });
      setStep(0);
      setSelectedPatient("");
      await loadRecent();
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {step < 7 ? "Part 1: Subjective Assessment" : "Part 2: Objective Assessment"}
        </h2>
        
        <div className="w-full bg-emerald-900/40 rounded-full h-2.5 mb-2 mt-4 overflow-hidden">
          <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
        </div>
        <div className="flex justify-between text-[11px] sm:text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <span>{STEPS[step]}</span>
          <span>Step {step + 1} of {STEPS.length}</span>
        </div>
      </div>

      <Card className={`bg-emerald-800 border-0 shadow-lg rounded-2xl overflow-hidden text-white border-t-4 ${step < 7 ? 'border-t-emerald-500' : 'border-t-amber-500'}`}>
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          {/* STEP 0 */}
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold border-b border-emerald-700 pb-2 mb-4 text-amber-400">Patient Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Link assessment to patient profile</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent className="bg-emerald-900/50 border-emerald-600 text-white">{patients.map(p => (<SelectItem key={p.user_id} value={p.user_id}>{p.username || p.user_id}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Hospital/Clinic ID</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.hospitalId} onChange={e => updateD("hospitalId", e.target.value)} /></div>
                <div className="space-y-2"><Label>Date of Assessment</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" type="date" value={d.dateOfAssessment} onChange={e => updateD("dateOfAssessment", e.target.value)} /></div>
                <div className="space-y-2"><Label>Assessed by</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.assessedBy} onChange={e => updateD("assessedBy", e.target.value)} /></div>
                <div className="space-y-2"><Label>Age</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.age} onChange={e => updateD("age", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Select value={d.sex} onValueChange={v => updateD("sex", v)}>
                    <SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Select sex" /></SelectTrigger>
                    <SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" type="date" value={d.dob} onChange={e => updateD("dob", e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Home address</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.homeAddress} onChange={e => updateD("homeAddress", e.target.value)} /></div>
                <div className="space-y-2"><Label>Caregiver/Parent Name</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.caregiverName} onChange={e => updateD("caregiverName", e.target.value)} /></div>
                <div className="space-y-2"><Label>Contact Number</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.caregiverContact} onChange={e => updateD("caregiverContact", e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold border-b border-emerald-700 pb-2 mb-4 text-amber-400">Birth and Perinatal History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Gestational age at birth (weeks)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.gestationalAge} onChange={e => updateD("gestationalAge", e.target.value)} /></div>
                <div className="space-y-2"><Label>Maternal illness during pregnancy (Hypertension, Diabetes, etc)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.maternalIllness} onChange={e => updateD("maternalIllness", e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Medication during pregnancy</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.maternalMeds} onChange={e => updateD("maternalMeds", e.target.value)} /></div>
                
                <h4 className="font-semibold text-amber-400 md:col-span-2 pt-2">Delivery History</h4>
                <div className="space-y-2"><Label>Place of delivery</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.placeOfDelivery} onChange={e => updateD("placeOfDelivery", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Mode of delivery</Label>
                  <Select value={d.modeOfDelivery} onValueChange={v => updateD("modeOfDelivery", v)}>
                    <SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Normal vaginal delivery">Normal vaginal</SelectItem><SelectItem value="Assisted delivery (forceps/vacuum)">Assisted</SelectItem><SelectItem value="Caesarean section">Caesarean section</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>APGAR score</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.apgarScore} onChange={e => updateD("apgarScore", e.target.value)} /></div>
                <div className="space-y-2"><Label>Birth complications (Asphyxia, NICU, etc.)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.birthComplications} onChange={e => updateD("birthComplications", e.target.value)} /></div>
                <div className="space-y-2"><Label>Time in NICU</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.nicuDuration} onChange={e => updateD("nicuDuration", e.target.value)} /></div>
                <div className="space-y-2"><Label>When did baby cry?</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.timeToCry} onChange={e => updateD("timeToCry", e.target.value)} /></div>
                <div className="space-y-2"><Label>When did baby suck/breastfeed?</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.timeToSuck} onChange={e => updateD("timeToSuck", e.target.value)} /></div>
                <div className="space-y-2"><Label>Head circumference</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.headCircumference} onChange={e => updateD("headCircumference", e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold border-b border-emerald-700 pb-2 mb-4 text-amber-400">Medical & CP Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2"><Label>Past Medical History</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.pastMedicalHistory} onChange={e => updateD("pastMedicalHistory", e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Present Medical History</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.presentMedicalHistory} onChange={e => updateD("presentMedicalHistory", e.target.value)} /></div>
                
                <div className="space-y-2">
                  <Label>Type of Cerebral Palsy</Label>
                  <Select value={d.cpType} onValueChange={v => updateD("cpType", v)}>
                    <SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Spastic">Spastic</SelectItem><SelectItem value="Dyskinetic">Dyskinetic</SelectItem><SelectItem value="Ataxic">Ataxic</SelectItem><SelectItem value="Hypotonic">Hypotonic</SelectItem><SelectItem value="Mixed">Mixed</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Distribution</Label>
                  <Select value={d.cpDistribution} onValueChange={v => updateD("cpDistribution", v)}>
                    <SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Distribution" /></SelectTrigger>
                    <SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Hemiplegia">Hemiplegia</SelectItem><SelectItem value="Diplegia">Diplegia</SelectItem><SelectItem value="Quadriplegia">Quadriplegia</SelectItem><SelectItem value="Triplegia">Triplegia</SelectItem><SelectItem value="Monoplegia">Monoplegia</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2"><Label>Neurological (Seizures, etc.)</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.neuro} onChange={e => updateD("neuro", e.target.value)} /></div>
                <div className="space-y-2"><Label>Sensory Impairments</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.sensory} onChange={e => updateD("sensory", e.target.value)} /></div>
                <div className="space-y-2"><Label>Communication & Cognitive</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.communication} onChange={e => updateD("communication", e.target.value)} /></div>
                <div className="space-y-2"><Label>Feeding & Oral-Motor</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.feeding} onChange={e => updateD("feeding", e.target.value)} /></div>
             </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2"><Label>Musculoskeletal</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.msk} onChange={e => updateD("msk", e.target.value)} /></div>
                <div className="space-y-2"><Label>Respiratory</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.respiratory} onChange={e => updateD("respiratory", e.target.value)} /></div>
                <div className="space-y-2"><Label>Behavioral</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.behavioral} onChange={e => updateD("behavioral", e.target.value)} /></div>
                <div className="space-y-2"><Label>Sleep</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.sleep} onChange={e => updateD("sleep", e.target.value)} /></div>
                <div className="space-y-2"><Label>Medications</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.medications} onChange={e => updateD("medications", e.target.value)} /></div>
                <div className="space-y-2"><Label>Surgeries</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.surgeries} onChange={e => updateD("surgeries", e.target.value)} /></div>
             </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2"><Label>Assistive Technologies</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.assistiveDevices} onChange={e => updateD("assistiveDevices", e.target.value)} /></div>
              <h4 className="font-semibold pt-4">Gross Motor Milestones (Age Achieved)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label className="text-xs">Head control</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossHeadControl} onChange={e => updateD("grossHeadControl", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-xs">Rolling</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossRolling} onChange={e => updateD("grossRolling", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-xs">Sitting</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossSitting} onChange={e => updateD("grossSitting", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-xs">Crawling</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossCrawling} onChange={e => updateD("grossCrawling", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-xs">Standing</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossStanding} onChange={e => updateD("grossStanding", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-xs">Walking</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossWalking} onChange={e => updateD("grossWalking", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Comments</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.grossComment} onChange={e => updateD("grossComment", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Fine Motor</Label>
                   <Select value={d.fineMotor} onValueChange={v => updateD("fineMotor", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Delayed">Delayed</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                   <Label>Speech</Label>
                   <Select value={d.speech} onValueChange={v => updateD("speech", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Delayed">Delayed</SelectItem><SelectItem value="Non-verbal">Non-verbal</SelectItem></SelectContent></Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2"><Label className="text-xs">Contraindication 1</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.contraindications1} onChange={e => updateD("contraindications1", e.target.value)} /></div>
                <div className="space-y-2"><Label className="text-xs">Precaution 1</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.precautions1} onChange={e => updateD("precautions1", e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2 border-t pt-4">
                  <Label>Rehabilitation Recommendations (Subjective)</Label>
                  <Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={d.recommendations} onChange={e => updateD("recommendations", e.target.value)} />
                </div>
            </div>
          )}

          {/* STEP 7 - OBJECTIVE */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-2"><Label>Observation (Deformity, lacerations, expressions, etc)</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.observation} onChange={e => updateO("observation", e.target.value)} /></div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                 <div className="space-y-2">
                   <Label>Supine</Label>
                   <Select value={o.supine} onValueChange={v => updateO("supine", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Symmetrical">Symmetrical</SelectItem><SelectItem value="Asymmetrical">Asymmetrical</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Prone</Label>
                   <Select value={o.prone} onValueChange={v => updateO("prone", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Able to lift head">Able to lift head</SelectItem><SelectItem value="Difficulty lifting head">Difficulty lifting head</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Sitting</Label>
                   <Select value={o.sitting} onValueChange={v => updateO("sitting", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Independent">Independent</SelectItem><SelectItem value="Supported">Supported</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Standing</Label>
                   <Select value={o.standing} onValueChange={v => updateO("standing", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Independent">Independent</SelectItem><SelectItem value="Supported">Supported</SelectItem><SelectItem value="Unable">Unable</SelectItem></SelectContent></Select>
                 </div>
               </div>

               <h4 className="font-semibold pt-4">Muscle Tone</h4>
               <div className="grid grid-cols-2 gap-4">
                 {[ 
                   { key: "toneRUL", label: "Right Upper Limb" }, 
                   { key: "toneLUL", label: "Left Upper Limb" }, 
                   { key: "toneTrunk", label: "Trunk" },
                   { key: "toneRLL", label: "Right Lower Limb" }, 
                   { key: "toneLLL", label: "Left Lower Limb" }
                 ].map(t => (
                   <div key={t.key} className="space-y-2">
                     <Label className="text-xs">{t.label}</Label>
                     <Select value={(o as any)[t.key]} onValueChange={v => updateO(t.key as any, v)}>
                       <SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger>
                       <SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Hypotonia">Hypotonia</SelectItem><SelectItem value="Hypertonia">Hypertonia</SelectItem><SelectItem value="Fluctuating">Fluctuating</SelectItem></SelectContent>
                     </Select>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* STEP 8 */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <h4 className="font-semibold text-sm">Modified Ashworth Scale (0 to 4)</h4>
               <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase text-neutral-600"><p>Left</p><p>Right</p></div>
               {[
                 {kR: "shoulderR", kL: "shoulderL", label: "Shoulder Flexors"}, {kR: "elbowR", kL: "elbowL", label: "Elbow Flexors"},
                 {kR: "wristR", kL: "wristL", label: "Wrist Flexors"}, {kR: "kneeR", kL: "kneeL", label: "Knee Flexors"}
               ].map(i => (
                 <div key={i.label} className="grid grid-cols-2 gap-4 items-center">
                   <div className="flex gap-2 items-center"><Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.ashworth as any)[i.kL]} onChange={e => updateNestedO("ashworth", i.kL, e.target.value)} /> <span className="text-xs truncate">{i.label}</span></div>
                   <Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.ashworth as any)[i.kR]} onChange={e => updateNestedO("ashworth", i.kR, e.target.value)} />
                 </div>
               ))}
               
               <h4 className="font-semibold text-sm pt-4 border-t">Range of Motion (ROM)</h4>
               {[
                 {kR: "shoulderR", kL: "shoulderL", label: "Shoulder"}, {kR: "elbowR", kL: "elbowL", label: "Elbow"},
                 {kR: "hipR", kL: "hipL", label: "Hip"}, {kR: "kneeR", kL: "kneeL", label: "Knee"}
               ].map(i => (
                 <div key={i.label} className="grid grid-cols-2 gap-4 items-center">
                   <div className="flex gap-2 items-center"><Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.rom as any)[i.kL]} onChange={e => updateNestedO("rom", i.kL, e.target.value)} /> <span className="text-xs truncate">{i.label}</span></div>
                   <Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.rom as any)[i.kR]} onChange={e => updateNestedO("rom", i.kR, e.target.value)} />
                 </div>
               ))}

               <div className="space-y-4 border-t border-emerald-700 pt-4">
                 <div className="space-y-2">
                   <Label>Contractures</Label>
                   <Select value={o.contractures} onValueChange={v => updateO("contractures", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Present">Present</SelectItem><SelectItem value="Absent">Absent</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label>Contractures Detail</Label><Textarea className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.contractureComment} onChange={e => updateO("contractureComment", e.target.value)} /></div>
               </div>
            </div>
          )}

          {/* STEP 9 */}
          {step === 9 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <h4 className="font-semibold text-sm">Muscle Strength</h4>
               {[
                 {kR: "neckR", kL: "neckL", label: "Neck"}, {kR: "trunkR", kL: "trunkL", label: "Trunk"},
                 {kR: "shoulderR", kL: "shoulderL", label: "Shoulder"}, {kR: "hipR", kL: "hipL", label: "Hip"}
               ].map(i => (
                 <div key={i.label} className="grid grid-cols-2 gap-4 items-center">
                   <div className="flex gap-2 items-center"><Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.strength as any)[i.kL]} onChange={e => updateNestedO("strength", i.kL, e.target.value)} /> <span className="text-xs truncate">{i.label}</span></div>
                   <Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.strength as any)[i.kR]} onChange={e => updateNestedO("strength", i.kR, e.target.value)} />
                 </div>
               ))}

               <h4 className="font-semibold text-sm pt-4 border-t">Deep Tendon Reflexes</h4>
               {[ {kR: "bicepsR", kL: "bicepsL", label: "Biceps"}, {kR: "patellarR", kL: "patellarL", label: "Patellar"} ].map(i => (
                 <div key={i.label} className="grid grid-cols-2 gap-4 items-center">
                   <div className="flex gap-2 items-center"><Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.reflexDTR as any)[i.kL]} onChange={e => updateNestedO("reflexDTR", i.kL, e.target.value)} /> <span className="text-xs truncate">{i.label}</span></div>
                   <Input className="w-16 h-8 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o.reflexDTR as any)[i.kR]} onChange={e => updateNestedO("reflexDTR", i.kR, e.target.value)} />
                 </div>
               ))}

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-700">
                  <div className="space-y-2"><Label>Primitive Reflexes</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" placeholder="e.g. Moro, ATNR" value={o.primitiveReflexes} onChange={e => updateO("primitiveReflexes", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Righting Reactions</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.rightingReactions} onChange={e => updateO("rightingReactions", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Protective Reactions</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.protectiveReactions} onChange={e => updateO("protectiveReactions", e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={o.protectiveStatus} onValueChange={v => updateO("protectiveStatus", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Integrated">Integrated</SelectItem><SelectItem value="Persistent">Persistent</SelectItem></SelectContent></Select>
                  </div>
               </div>
            </div>
          )}

          {/* STEP 10 */}
          {step === 10 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <h4 className="font-semibold text-sm">Balance & Coordination</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Sitting Balance</Label>
                   <Select value={o.sitBal} onValueChange={v => updateO("sitBal", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Poor">Poor</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label>Comment</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.sitBalCom} onChange={e => updateO("sitBalCom", e.target.value)} /></div>
                 <div className="space-y-2">
                   <Label>Standing Balance</Label>
                   <Select value={o.standBal} onValueChange={v => updateO("standBal", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Poor">Poor</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label>Comment</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.standBalCom} onChange={e => updateO("standBalCom", e.target.value)} /></div>
               </div>

               <h4 className="font-semibold text-sm pt-4 border-t">Coordination</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-xs">Nose</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.coordNose} onChange={e => updateO("coordNose", e.target.value)}/></div>
                 <div className="space-y-2"><Label className="text-xs">Finger</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.coordFinger} onChange={e => updateO("coordFinger", e.target.value)}/></div>
                 <div className="space-y-2 col-span-2"><Label>Comment</Label><Textarea className="h-12 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.coordCom} onChange={e => updateO("coordCom", e.target.value)} /></div>
               </div>

               <h4 className="font-semibold text-sm pt-4 border-t">Sensory</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Light Touch</Label>
                   <Select value={o.sensoryLight} onValueChange={v => updateO("sensoryLight", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Impaired">Impaired</SelectItem><SelectItem value="Absent">Absent</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label>Comment</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.sensoryLightCom} onChange={e=>updateO("sensoryLightCom", e.target.value)}/></div>
                 <div className="space-y-2">
                   <Label>Proprioception</Label>
                   <Select value={o.sensoryProp} onValueChange={v => updateO("sensoryProp", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Impaired">Impaired</SelectItem><SelectItem value="Absent">Absent</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label>Comment</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.sensoryPropCom} onChange={e=>updateO("sensoryPropCom", e.target.value)}/></div>
               </div>
            </div>
          )}

          {/* STEP 11 */}
          {step === 11 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <h4 className="font-semibold text-sm">Functional Mobility</h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 {[
                   {k: "mobRolling", l: "Rolling"}, {k: "mobSitting", l: "Sitting"}, 
                   {k: "mobStanding", l: "Standing"}, {k: "mobWalking", l: "Walking"}
                 ].map(i => (
                   <div key={i.k} className="col-span-2 grid grid-cols-2 gap-4 items-center">
                     <div>
                       <Label className="text-xs">{i.l}</Label>
                       <Select value={(o as any)[i.k]} onValueChange={v => updateO(i.k as any, v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Independent">Independent</SelectItem><SelectItem value="Assisted">Assisted</SelectItem><SelectItem value="Dependent">Dependent</SelectItem></SelectContent></Select>
                     </div>
                     <div className="space-y-1"><Label className="text-xs">Comment</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={(o as any)[i.k+"Com"]} onChange={e=>updateO((i.k+"Com") as any, e.target.value)} /></div>
                   </div>
                 ))}
               </div>

               <h4 className="font-semibold text-sm pt-4 border-t">Activities of Daily Living (ADLs)</h4>
               <div className="grid grid-cols-2 gap-4">
                 {[
                   {k: "adlFeeding", l: "Feeding"}, {k: "adlDressing", l: "Dressing"},
                   {k: "adlBathing", l: "Bathing"}, {k: "adlToileting", l: "Toileting"}
                 ].map(i => (
                   <div key={i.k} className="space-y-2">
                     <Label className="text-xs">{i.l}</Label>
                     <Select value={(o as any)[i.k]} onValueChange={v => updateO(i.k as any, v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Independent">Independent</SelectItem><SelectItem value="Assisted">Assisted</SelectItem><SelectItem value="Dependent">Dependent</SelectItem></SelectContent></Select>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* STEP 12 */}
          {step === 12 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h4 className="font-semibold text-sm">Pain Assessment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <Label>Pain Present?</Label>
                   <Select value={o.painPresent} onValueChange={v => updateO("painPresent", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2"><Label>Scale (0-10)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.painScale} onChange={e=>updateO("painScale", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Location</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.painLocation} onChange={e=>updateO("painLocation", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Nature</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.painNature} onChange={e=>updateO("painNature", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Aggravating Factors</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.painAggravating} onChange={e=>updateO("painAggravating", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Relieving Factors</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.painRelieving} onChange={e=>updateO("painRelieving", e.target.value)} /></div>
                </div>

                <h4 className="font-semibold text-sm pt-4 border-t">Functional Classifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label className="truncate">GMFCS Level</Label><Select value={o.gmfcs} onValueChange={v=>updateO("gmfcs", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white">{["I","II","III","IV","V"].map(l=><SelectItem key={l} value={`Level ${l}`}>Level {l}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label className="truncate">MACS Level</Label><Select value={o.macs} onValueChange={v=>updateO("macs", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white">{["I","II","III","IV","V"].map(l=><SelectItem key={l} value={`Level ${l}`}>Level {l}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label className="truncate">CFCS Level</Label><Select value={o.cfcs} onValueChange={v=>updateO("cfcs", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white">{["I","II","III","IV","V"].map(l=><SelectItem key={l} value={`Level ${l}`}>Level {l}</SelectItem>)}</SelectContent></Select></div>
                </div>
             </div>
          )}

          {/* STEP 13 */}
          {step === 13 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <h4 className="font-semibold text-sm">Environmental Assessment</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Surfaces</Label>
                   <Select value={o.envSurfaces} onValueChange={v=>updateO("envSurfaces", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Stairs with grab bars">Stairs with grab bars</SelectItem><SelectItem value="Inclined surfaces">Inclined surfaces</SelectItem><SelectItem value="Uneven surfaces">Uneven surfaces</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Lighting</Label>
                   <Select value={o.envLighting} onValueChange={v=>updateO("envLighting", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Adequate">Adequate</SelectItem><SelectItem value="Inadequate">Inadequate</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2"><Label>Door Length (cm)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.envDoorLength} onChange={e=>updateO("envDoorLength", e.target.value)} /></div>
                 <div className="space-y-2"><Label>Door Width (cm)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.envDoorWidth} onChange={e=>updateO("envDoorWidth", e.target.value)} /></div>
                 
                 <div className="space-y-2">
                   <Label>Noise Level</Label>
                   <Select value={o.envNoise} onValueChange={v=>updateO("envNoise", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Quiet">Quiet</SelectItem><SelectItem value="Moderate">Moderate</SelectItem><SelectItem value="Noisy">Noisy</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Wheelchair Accessible</Label>
                   <Select value={o.envAccessible} onValueChange={v=>updateO("envAccessible", v)}><SelectTrigger className="bg-emerald-900/50 border-emerald-600 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-emerald-900/50 border-emerald-600 text-white"><SelectItem value="Yes">Yes</SelectItem><SelectItem value="Limited access">Limited access</SelectItem></SelectContent></Select>
                 </div>
                 <div className="space-y-2 col-span-2"><Label>Availability of Play Materials/Toys</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" placeholder="Balls, Blocks, Sensory toys..." value={o.envToys} onChange={e=>updateO("envToys", e.target.value)} /></div>
               </div>
            </div>
          )}

          {/* STEP 14 */}
          {step === 14 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <h4 className="font-semibold text-sm">Goals & Rehabilitation Plan</h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-xs text-amber-400">Obj. Contraindication</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.objContra} onChange={e => updateO("objContra", e.target.value)} /></div>
                 <div className="space-y-2"><Label className="text-xs text-amber-400">Obj. Precaution</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.objPre} onChange={e => updateO("objPre", e.target.value)} /></div>
                 <div className="space-y-2"><Label className="text-xs text-red-400">Red flags</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.redFlags} onChange={e => updateO("redFlags", e.target.value)} /></div>
                 <div className="space-y-2"><Label className="text-xs text-yellow-400">Yellow flags</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.yellowFlags} onChange={e => updateO("yellowFlags", e.target.value)} /></div>
               </div>

               <div className="grid grid-cols-2 gap-4 border-t pt-4">
                 <div className="space-y-2"><Label>STG 1</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.stg1} onChange={e=>updateO("stg1", e.target.value)} /></div>
                 <div className="space-y-2"><Label>LTG 1</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.ltg1} onChange={e=>updateO("ltg1", e.target.value)} /></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-emerald-700 pt-4">
                 <div className="space-y-2"><Label>Freq of therapy (sessions/week)</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.freq} onChange={e=>updateO("freq", e.target.value)} /></div>
                 <div className="space-y-2"><Label>Referrals</Label><Input className="bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.referral} onChange={e=>updateO("referral", e.target.value)} /></div>
                 <div className="space-y-2 md:col-span-2">
                  <Label>Overall Clinical Notes & Plan</Label>
                  <Textarea className="h-24 bg-emerald-900/50 border-emerald-600 text-white placeholder:text-white/40" value={o.clinicalNotes} onChange={e=>updateO("clinicalNotes", e.target.value)} />
                 </div>
               </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between pt-6 border-t border-emerald-700 mt-8">
            <Button variant="outline" onClick={handlePrev} disabled={step === 0} className="w-24 border-emerald-600 text-white hover:bg-emerald-700">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext} className={`w-24 ${step < 6 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-500 hover:bg-amber-400 text-emerald-950'} text-white font-bold`}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting || !selectedPatient} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-8">
                {submitting ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Complete & Save</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recents */}
      {recent.length > 0 && (
         <div className="mt-8">
           <h3 className="flex items-center text-white font-bold mb-4"><ClipboardList className="w-5 h-5 mr-2"/> Recent Assessments</h3>
           <div className="grid gap-3">
             {recent.map(r => (
               <div key={r.id} className="bg-emerald-800 p-4 border border-emerald-700 shadow-sm rounded-xl">
                 <div className="flex items-center justify-between">
                   <div className="font-semibold text-white">{r.full_name || "Unknown Patient"}</div>
                   <div className="text-xs text-amber-400 bg-emerald-900/60 px-2 py-1 rounded-md">{new Date(r.created_at).toLocaleDateString()}</div>
                 </div>
                 {r.rehab_recommendations && <p className="text-sm text-white/70 mt-2 line-clamp-1">{r.rehab_recommendations}</p>}
               </div>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}
