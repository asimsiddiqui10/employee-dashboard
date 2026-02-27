import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Eye, EyeOff, CheckCircle2, AlertCircle, Upload, Loader2,
  ArrowLeft, X, FileText, Camera, Crop, Trash2, FileCheck,
} from 'lucide-react';
import actLogo from '@/assets/ACT New Logo HD.png';

const API_BASE = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_API_URL_PROD;

const api = axios.create({ baseURL: API_BASE });

// Steps 1–8 are form steps; step 9 is the success screen
const FORM_STEPS = 8;
const TOTAL_STEPS = 9;

const STEP_LABELS = [
  '',
  'Welcome',
  'Personal Information',
  'Address & Background',
  'Employment Details',
  'Identity & Emergency',
  'Documents & Photo',
  'Account Setup',
  'Review & Submit',
  'Complete',
];

const DEPARTMENTS = [
  'Engineering', 'Production', 'Administration', 'Management',
  'Sales', 'Warehouse', 'Manufacturing', 'WellServices', 'Operations', 'Admin', 'Other',
];

const DOCUMENT_SLOTS = [
  { id: 'gov_id',         label: "Driver's License / State ID" },
  { id: 'passport',       label: 'Passport' },
  { id: 'ssn_card',       label: 'Social Security Card' },
  { id: 'i9',             label: 'I-9 (Employment Eligibility Verification)' },
  { id: 'w4',             label: 'W-4 (Federal Tax Withholding)' },
  { id: 'direct_deposit', label: 'Direct Deposit Authorization' },
  { id: 'personal',       label: 'Personal Documents' },
  { id: 'company',        label: 'Signed Company Documents' },
  { id: 'benefits',       label: 'Benefits Enrollment Forms' },
  { id: 'training',       label: 'Training Certificates' },
  { id: 'certifications', label: 'Professional Certifications' },
  { id: 'other',          label: 'Other Documents' },
];

const initDocUploads = () =>
  Object.fromEntries(DOCUMENT_SLOTS.map(s => [s.id, null]));

const initialForm = {
  name: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', maritalStatus: '',
  address: '', city: '', state: '', zipCode: '', nationality: '', educationLevel: '', certifications: '',
  department: '', position: '', jobTitle: '', employmentType: '', compensationType: '', compensationValue: '', dateOfHire: '',
  ssn: '', emergencyContactName: '', emergencyContactPhone: '',
  profilePicUrl: '',
  docUploads: initDocUploads(),
  password: '', confirmPassword: '',
};

// ─── CropDialog ─────────────────────────────────────────────────────────────

function CropDialog({ imageSrc, onApply, onClose }) {
  const canvasRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, size: 0 });
  const [dragging, setDragging] = useState(false);
  const [pointerStart, setPointerStart] = useState({ px: 0, py: 0, bx: 0, by: 0 });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      const MAX = 440;
      const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
      const dw = Math.floor(img.naturalWidth * scale);
      const dh = Math.floor(img.naturalHeight * scale);
      const size = Math.floor(Math.min(dw, dh) * 0.8);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setDisplaySize({ w: dw, h: dh });
      setCropBox({ x: Math.floor((dw - size) / 2), y: Math.floor((dh - size) / 2), size });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setPointerStart({ px: e.clientX, py: e.clientY, bx: cropBox.x, by: cropBox.y });
  }, [cropBox.x, cropBox.y]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - pointerStart.px;
    const dy = e.clientY - pointerStart.py;
    setCropBox(prev => ({
      ...prev,
      x: Math.max(0, Math.min(pointerStart.bx + dx, displaySize.w - prev.size)),
      y: Math.max(0, Math.min(pointerStart.by + dy, displaySize.h - prev.size)),
    }));
  }, [dragging, pointerStart, displaySize]);

  const handlePointerUp = () => setDragging(false);

  const handleApply = () => {
    setApplying(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    const img = new window.Image();
    img.onload = () => {
      const scaleX = naturalSize.w / displaySize.w;
      const scaleY = naturalSize.h / displaySize.h;
      const sx = Math.round(cropBox.x * scaleX);
      const sy = Math.round(cropBox.y * scaleY);
      const sw = Math.round(cropBox.size * scaleX);
      const sh = Math.round(cropBox.size * scaleY);
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 300, 300);
      canvas.toBlob((blob) => {
        if (blob) onApply(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
        setApplying(false);
      }, 'image/jpeg', 0.92);
    };
    img.src = imageSrc;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-4 w-4" />
            Crop Profile Photo
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Drag the circle to reposition. This circular area will become your profile photo.
        </p>
        <div className="flex justify-center my-2">
          {displaySize.w > 0 ? (
            <div
              className="relative select-none overflow-hidden rounded"
              style={{ width: displaySize.w, height: displaySize.h, flexShrink: 0 }}
            >
              <img
                src={imageSrc}
                alt="crop preview"
                draggable={false}
                style={{ width: displaySize.w, height: displaySize.h, display: 'block' }}
              />
              <div
                className="absolute cursor-move"
                style={{
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.size,
                  height: cropBox.size,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                  touchAction: 'none',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 w-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply} disabled={applying || displaySize.w === 0}>
            {applying
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Applying...</>
              : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DocumentSlot ────────────────────────────────────────────────────────────

function DocumentSlot({ slot, uploadState, onUpload, onRemove, uploading }) {
  const inputRef = useRef(null);

  return (
    <div className={`rounded-lg border p-3 space-y-2 transition-colors ${
      uploadState
        ? 'border-green-500/50 bg-green-500/5'
        : 'border-dashed hover:border-muted-foreground/40'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {uploadState
            ? <FileCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
            : <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          }
          <span className="text-xs font-medium leading-tight">{slot.label}</span>
        </div>
        {uploadState && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {uploadState ? (
        <p className="text-xs text-muted-foreground truncate pl-6">{uploadState.fileName}</p>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            className="hidden"
            onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
            disabled={uploading}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Uploading...</>
              : <><Upload className="h-3 w-3 mr-1" />Upload File</>
            }
          </Button>
        </>
      )}
    </div>
  );
}

// ─── ReviewSection / ReviewRow ───────────────────────────────────────────────

function ReviewSection({ title, children }) {
  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-44 flex-shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [createdEmployeeId, setCreatedEmployeeId] = useState('');

  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);

  const profileInputRef = useRef(null);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/onboarding/verify/${token}`);
        if (res.data.success && res.data.email) {
          setForm(f => ({ ...f, email: res.data.email }));
        }
      } catch (err) {
        setPageError(err.response?.data?.message || 'Invalid or expired invite link');
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [token]);

  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 2) {
      if (!form.name.trim()) errs.name = 'Required';
      if (!form.email.trim()) errs.email = 'Required';
      if (!form.gender) errs.gender = 'Required';
    }
    if (step === 4) {
      if (!form.department) errs.department = 'Required';
      if (!form.employmentType) errs.employmentType = 'Required';
      if (!form.compensationType) errs.compensationType = 'Required';
    }
    if (step === 5) {
      if (!form.ssn.trim()) errs.ssn = 'Required';
    }
    if (step === 7) {
      if (!form.password) errs.password = 'Required';
      else if (form.password.length < 6) errs.password = 'At least 6 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const back = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  // Profile pic: select → crop dialog
  const handleProfilePicSelect = (file) => {
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropApply = async (croppedFile) => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setUploadingProfilePic(true);
    try {
      const fd = new FormData();
      fd.append('file', croppedFile);
      const res = await api.post(`/onboarding/upload/${token}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) setField('profilePicUrl', res.data.fileUrl);
    } catch (err) {
      setErrors(e => ({ ...e, profilePic: 'Upload failed: ' + (err.response?.data?.message || err.message) }));
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleCropClose = () => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  // Document upload
  const handleDocUpload = async (slotId, file) => {
    setUploadingDoc(slotId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/onboarding/upload/${token}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setForm(f => ({
          ...f,
          docUploads: { ...f.docUploads, [slotId]: { fileUrl: res.data.fileUrl, fileName: res.data.fileName } },
        }));
      }
    } catch (err) {
      setErrors(e => ({ ...e, [`doc_${slotId}`]: 'Upload failed' }));
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeDoc = (slotId) => {
    setForm(f => ({ ...f, docUploads: { ...f.docUploads, [slotId]: null } }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setPageError('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        gender: form.gender,
        ssn: form.ssn,
        department: form.department,
        employmentType: form.employmentType,
        compensationType: form.compensationType,
        ...(form.maritalStatus && { maritalStatus: form.maritalStatus }),
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        ...(form.dateOfBirth && { dateOfBirth: form.dateOfBirth }),
        ...(form.address && { address: form.address }),
        ...(form.city && { city: form.city }),
        ...(form.state && { state: form.state }),
        ...(form.zipCode && { zipCode: form.zipCode }),
        ...(form.nationality && { nationality: form.nationality }),
        ...(form.educationLevel && { educationLevel: form.educationLevel }),
        ...(form.certifications && { certifications: form.certifications }),
        ...(form.position && { position: form.position }),
        ...(form.jobTitle && { jobTitle: form.jobTitle }),
        ...(form.compensationValue && { compensationValue: form.compensationValue }),
        ...(form.dateOfHire && { dateOfHire: form.dateOfHire }),
        ...(form.profilePicUrl && { profilePic: form.profilePicUrl }),
        ...(form.emergencyContactName && { emergencyContactName: form.emergencyContactName }),
        ...(form.emergencyContactPhone && { emergencyContactPhone: form.emergencyContactPhone }),
      };
      const res = await api.post(`/onboarding/complete/${token}`, payload);
      if (res.data.success) {
        setCreatedEmployeeId(res.data.employeeId);
        setStep(TOTAL_STEPS);
        window.scrollTo(0, 0);
      } else {
        setPageError(res.data.message || 'Submission failed');
      }
    } catch (err) {
      setPageError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const isSuccess = step === TOTAL_STEPS;
  const progress = step <= FORM_STEPS ? ((step - 1) / (FORM_STEPS - 1)) * 100 : 100;

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src={actLogo} alt="American Completion Tools" className="h-12 object-contain" />
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying your invite link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top bar */}
      <header className="bg-background border-b px-6 py-3 flex items-center">
        <img src={actLogo} alt="American Completion Tools" className="h-10 object-contain" />
      </header>

      <div className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-2xl space-y-5">

          {/* Progress bar — visible steps 2–8 */}
          {step > 1 && !isSuccess && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={back}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-medium">Step {step} of {FORM_STEPS}</span>
                  <span className="text-muted-foreground text-sm"> · {STEP_LABELS[step]}</span>
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Global error banner */}
          {pageError && step !== 8 && (
            <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {pageError}
            </div>
          )}

          {/* ── Step 1: Welcome ─────────────────────────────────────────── */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Employee Onboarding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pageError ? (
                  <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {pageError} Please contact your administrator for a new invite.
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      You've been invited to complete your onboarding at{' '}
                      <strong>American Completion Tools</strong>. This wizard takes about 5–10 minutes.
                    </p>
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">Please have the following ready:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Government-issued photo ID</li>
                        <li>Social Security Number</li>
                        <li>Emergency contact information</li>
                        <li>Bank details (for direct deposit)</li>
                        <li>Any relevant certifications or licenses</li>
                      </ul>
                    </div>
                    <Button className="w-full" size="lg" onClick={next}>
                      Get Started
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Personal Information ────────────────────────────── */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name <span className="text-destructive">*</span></Label>
                    <Input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="John Doe" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Address <span className="text-destructive">*</span></Label>
                    <Input value={form.email} onChange={e => setField('email', e.target.value)} placeholder="john@example.com" type="email" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input value={form.phoneNumber} onChange={e => setField('phoneNumber', e.target.value)} placeholder="+1 555 000 0000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <Input value={form.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)} type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender <span className="text-destructive">*</span></Label>
                    <Select value={form.gender} onValueChange={v => setField('gender', v)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Marital Status</Label>
                    <Select value={form.maritalStatus} onValueChange={v => setField('maritalStatus', v)}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Separated">Separated</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 3: Address & Background ────────────────────────────── */}
          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>Address & Background</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Street Address</Label>
                    <Input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Houston" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input value={form.state} onChange={e => setField('state', e.target.value)} placeholder="TX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Zip Code</Label>
                    <Input value={form.zipCode} onChange={e => setField('zipCode', e.target.value)} placeholder="77001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nationality</Label>
                    <Input value={form.nationality} onChange={e => setField('nationality', e.target.value)} placeholder="American" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Highest Education Level</Label>
                    <Input value={form.educationLevel} onChange={e => setField('educationLevel', e.target.value)} placeholder="Bachelor's Degree" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Certifications</Label>
                    <Textarea
                      value={form.certifications}
                      onChange={e => setField('certifications', e.target.value)}
                      placeholder="Comma-separated (e.g. OSHA 30, PMP, AWS Certified)"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 4: Employment Details ───────────────────────────────── */}
          {step === 4 && (
            <Card>
              <CardHeader><CardTitle>Employment Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Department <span className="text-destructive">*</span></Label>
                    <Select value={form.department} onValueChange={v => setField('department', v)}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Position</Label>
                    <Input value={form.position} onChange={e => setField('position', e.target.value)} placeholder="Senior Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job Title</Label>
                    <Input value={form.jobTitle} onChange={e => setField('jobTitle', e.target.value)} placeholder="Field Engineer" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date of Hire</Label>
                    <Input value={form.dateOfHire} onChange={e => setField('dateOfHire', e.target.value)} type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employment Type <span className="text-destructive">*</span></Label>
                    <Select value={form.employmentType} onValueChange={v => setField('employmentType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time/Part-time">Full-time / Part-time</SelectItem>
                        <SelectItem value="Contract/Hourly">Contract / Hourly</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employmentType && <p className="text-xs text-destructive">{errors.employmentType}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Compensation Type <span className="text-destructive">*</span></Label>
                    <Select value={form.compensationType} onValueChange={v => setField('compensationType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select compensation" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly Salary">Monthly Salary</SelectItem>
                        <SelectItem value="Hourly Rate">Hourly Rate</SelectItem>
                        <SelectItem value="Total Compensation">Total Compensation</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.compensationType && <p className="text-xs text-destructive">{errors.compensationType}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Compensation Value</Label>
                    <Input
                      value={form.compensationValue}
                      onChange={e => setField('compensationValue', e.target.value)}
                      type="number"
                      placeholder="e.g. 75000"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 5: Identity & Emergency ────────────────────────────── */}
          {step === 5 && (
            <Card>
              <CardHeader><CardTitle>Identity & Emergency Contact</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Social Security Number (SSN) <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.ssn}
                    onChange={e => setField('ssn', e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    type="password"
                    autoComplete="off"
                  />
                  {errors.ssn && <p className="text-xs text-destructive">{errors.ssn}</p>}
                  <p className="text-xs text-muted-foreground">Your SSN is encrypted and stored securely.</p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Emergency Contact{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Contact Name</Label>
                      <Input value={form.emergencyContactName} onChange={e => setField('emergencyContactName', e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Contact Phone</Label>
                      <Input value={form.emergencyContactPhone} onChange={e => setField('emergencyContactPhone', e.target.value)} placeholder="+1 555 000 0000" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 6: Documents & Photo ────────────────────────────────── */}
          {step === 6 && (
            <Card>
              <CardHeader><CardTitle>Documents & Profile Photo</CardTitle></CardHeader>
              <CardContent className="space-y-6">

                {/* Profile photo */}
                <div className="space-y-3">
                  <div>
                    <Label>Profile Photo</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Optional. You'll be able to crop the photo before it's uploaded.
                    </p>
                  </div>
                  {form.profilePicUrl ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={form.profilePicUrl}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover border-2 border-muted"
                      />
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 font-medium">Photo uploaded</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setField('profilePicUrl', '');
                            if (profileInputRef.current) profileInputRef.current.value = '';
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      {uploadingProfilePic ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Uploading photo…
                        </div>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to select a photo</p>
                          <p className="text-xs text-muted-foreground mt-1">Crop tool will open after selection</p>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleProfilePicSelect(e.target.files[0])}
                  />
                  {errors.profilePic && <p className="text-xs text-destructive">{errors.profilePic}</p>}
                </div>

                <Separator />

                {/* Document uploads */}
                <div className="space-y-3">
                  <div>
                    <Label>Documents</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All optional. Upload any applicable documents — PDF, image, or Word files accepted.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOCUMENT_SLOTS.map(slot => (
                      <DocumentSlot
                        key={slot.id}
                        slot={slot}
                        uploadState={form.docUploads[slot.id]}
                        onUpload={file => handleDocUpload(slot.id, file)}
                        onRemove={() => removeDoc(slot.id)}
                        uploading={uploadingDoc === slot.id}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 7: Account Setup ────────────────────────────────────── */}
          {step === 7 && (
            <Card>
              <CardHeader><CardTitle>Account Setup</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a password for your employee account. You'll use your email and this password to log in.
                </p>
                <div className="space-y-1.5">
                  <Label>Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      placeholder="At least 6 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirm(v => !v)}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 8: Review & Submit ──────────────────────────────────── */}
          {step === 8 && (
            <Card>
              <CardHeader><CardTitle>Review Your Information</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <ReviewSection title="Personal Information">
                  <ReviewRow label="Name" value={form.name} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Phone" value={form.phoneNumber} />
                  <ReviewRow label="Date of Birth" value={form.dateOfBirth} />
                  <ReviewRow label="Gender" value={form.gender} />
                  <ReviewRow label="Marital Status" value={form.maritalStatus} />
                </ReviewSection>
                <Separator />
                <ReviewSection title="Address & Background">
                  <ReviewRow
                    label="Address"
                    value={[form.address, form.city, form.state, form.zipCode].filter(Boolean).join(', ')}
                  />
                  <ReviewRow label="Nationality" value={form.nationality} />
                  <ReviewRow label="Education" value={form.educationLevel} />
                  <ReviewRow label="Certifications" value={form.certifications} />
                </ReviewSection>
                <Separator />
                <ReviewSection title="Employment">
                  <ReviewRow label="Department" value={form.department} />
                  <ReviewRow label="Position" value={form.position} />
                  <ReviewRow label="Job Title" value={form.jobTitle} />
                  <ReviewRow label="Employment Type" value={form.employmentType} />
                  <ReviewRow
                    label="Compensation"
                    value={form.compensationType + (form.compensationValue ? ` — $${form.compensationValue}` : '')}
                  />
                  <ReviewRow label="Date of Hire" value={form.dateOfHire} />
                </ReviewSection>
                <Separator />
                <ReviewSection title="Identity">
                  <ReviewRow label="SSN" value="•••••••••  (provided)" />
                  <ReviewRow
                    label="Emergency Contact"
                    value={[form.emergencyContactName, form.emergencyContactPhone].filter(Boolean).join(' · ')}
                  />
                </ReviewSection>
                {form.profilePicUrl && (
                  <>
                    <Separator />
                    <ReviewSection title="Profile Photo">
                      <div className="pl-0 mt-1">
                        <img src={form.profilePicUrl} alt="Profile" className="h-14 w-14 rounded-full object-cover border" />
                      </div>
                    </ReviewSection>
                  </>
                )}
                {Object.entries(form.docUploads).some(([, v]) => v) && (
                  <>
                    <Separator />
                    <ReviewSection title="Uploaded Documents">
                      {DOCUMENT_SLOTS.filter(s => form.docUploads[s.id]).map(s => (
                        <ReviewRow key={s.id} label={s.label} value={form.docUploads[s.id].fileName} />
                      ))}
                    </ReviewSection>
                  </>
                )}
                {pageError && (
                  <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {pageError}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Step 9: Success ──────────────────────────────────────────── */}
          {isSuccess && (
            <Card>
              <CardContent className="py-12 text-center space-y-5">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-5">
                    <CheckCircle2 className="h-14 w-14 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">Onboarding Complete!</h2>
                  <p className="text-muted-foreground text-sm">Your employee account has been created successfully.</p>
                </div>
                <div className="bg-muted rounded-lg px-8 py-5 inline-block">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Your Employee ID</p>
                  <p className="text-3xl font-mono font-bold">{createdEmployeeId}</p>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  You can now log in with your email and the password you just created.
                </p>
                <Button className="w-full max-w-xs" size="lg" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Navigation — Next / Submit (Back is handled in the progress bar) */}
          {step > 1 && !isSuccess && (
            <div className="flex justify-end">
              {step < FORM_STEPS ? (
                <Button
                  onClick={next}
                  disabled={uploadingProfilePic || !!uploadingDoc}
                  size="lg"
                  className="min-w-32"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                  className="min-w-44"
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                    : 'Submit Application'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Crop dialog */}
      {cropSrc && (
        <CropDialog
          imageSrc={cropSrc}
          onApply={handleCropApply}
          onClose={handleCropClose}
        />
      )}
    </div>
  );
}
