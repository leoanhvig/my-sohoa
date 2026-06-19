import {
  addHealthFormRecord,
  findDuplicateHealthFormRecord,
  getHealthFormRecordById,
  updateHealthFormRecord,
} from '@/apis/healthForm'
import { Button } from '@/Components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useUserStore } from '@/stores/userStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

type HealthFormValue = string | string[]
type HealthFormValues = Record<string, HealthFormValue>

type HealthFormField = {
  name: string
  label: string
  component?: 'input' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  multiple?: boolean
  saveData?: boolean
  required?: boolean
}

type PendingDuplicateSave = {
  values: HealthFormValues
  patientCode: string
  fullName: string
} | null

const savedFieldLabels = [
  'STT/Mã bệnh nhân',
  'Địa điểm khám',
  'Ngày khám',
  'Họ và Tên',
  'Năm sinh',
  'Tuổi',
  'Số điện thoại',
  'Chiều cao',
  'Cân nặng',
  'Dân tộc',
  'Phường/xã',
  'Tỉnh/TP',
  'Đơn vị công tác',
  'Học vấn',
  'Trình độ',
  'PARA',
  'Tuổi QHTD đầu tiên',
  'Đời sống tình cảm',
  'Biện pháp tránh thai',
  'Tiêm vắc xin HPV?',
  'Loại vắc xin đã tiêm',
  'Số mũi',
  'Đã tầm soát UTCTC?',
  'Phương pháp đã làm',
  'Kết quả',
  'Năm tầm soát',
  'Bệnh phụ khoa',
  'Bệnh nền',
  'Hút thuốc lá',
  'Bia rượu',
  'Tình trạng HIV',
  'Thuốc ức chế MD',
  'Tập thể dục',
  'Bơi lội',
  'GĐ mắc UT CTC?',
  'Triệu chứng hiện tại',
  'Kết quả AI',
  'Nhận xét của Bác Sĩ',
  'Hướng xử trí',
]

const baseFormFields: HealthFormField[] = [
  {
    name: 'clinicLocation',
    label: 'Địa điểm khám',
    component: 'select',
    options: [
      'Nhà VH Lao Động TP. Thủ Đức',
      'Nhà VH Lao Động Củ Chi',
      'Nhà VH Lao Động Khu CNC',
    ],
  },
  {
    name: 'examDate',
    label: 'Ngày khám',
    component: 'select',
    options: ['9/5/26', '10/5/26', '16/5/26', '17/5/26'],
  },
  { name: 'patientCode', label: 'STT/Mã bệnh nhân' },
  { name: 'fullName', label: 'Họ và Tên' },
  { name: 'birthYear', label: 'Năm sinh' },
  // { name: 'age', label: 'Tuổi' },
  { name: 'phoneNumber', label: 'Số điện thoại' },
  { name: 'height', label: 'Chiều cao', placeholder: 'cm' },
  { name: 'weight', label: 'Cân nặng', placeholder: 'kg' },
  { name: 'ethnicity', label: 'Dân tộc' },
  { name: 'ward', label: 'Phường/xã' },
  { name: 'province', label: 'Tỉnh/TP' },
  { name: 'workplace', label: 'Đơn vị công tác' },
  { name: 'details', label: 'Chi tiết', placeholder: 'Ví dụ 6/12' },
  {
    name: 'education',
    label: 'Trình độ',
    component: 'select',
    options: ['TH', 'THCS', 'THPT', 'CĐ/ĐH', 'Sau ĐH'],
  },
  {
    name: 'para',
    label: 'PARA',
    placeholder: 'Ví dụ 3-0-0-3, chỉ cần nhập 3003',
  },
  { name: 'firstSexAge', label: 'Tuổi QHTD đầu tiên' },
  {
    name: 'relationshipStatus',
    label: 'Đời sống tình cảm',
    component: 'select',
    options: ['Một bạn đời', 'Nhiều hơn một bạn đời'],
  },
  {
    name: 'contraception',
    label: 'Biện pháp tránh thai',
    component: 'select',
    options: [
      'Không',
      'Bao cao su',
      'Thuốc uống',
      'Vòng tránh thai',
      'Tiêm cấy',
      'Khác',
    ],
  },
  {
    name: 'contraceptionYears',
    label: 'Số năm dùng thuốc uống',
    placeholder: 'Nhập số năm',
  },
  {
    name: 'otherContraception',
    label: 'Tên biện pháp tránh thai khác',
    placeholder: 'Nhập tên biện pháp',
  },
  {
    name: 'hpvVaccinated',
    label: 'Tiêm vắc xin HPV?',
    component: 'select',
    options: ['Chưa tiêm', 'Đã tiêm', 'Không nhớ'],
  },
  { name: 'hpvVaccineType', label: 'Loại vắc xin đã tiêm' },
  { name: 'hpvDoseCount', label: 'Số mũi' },
  {
    name: 'cervicalCancerScreened',
    label: 'Đã tầm soát UTCTC?',
    component: 'select',
    options: ['Chưa bao giờ', 'Đã từng'],
  },
  {
    name: 'screeningMethod',
    label: 'Phương pháp đã làm',
    component: 'select',
    multiple: true,
    options: ['Pap smear', 'HPV test', 'VIA', 'Khác'],
  },
  {
    name: 'otherScreeningMethod',
    label: 'Phương pháp khác',
    placeholder: 'Nhập phương pháp đã làm',
  },
  {
    name: 'screeningResult',
    label: 'Kết quả',
    component: 'select',
    options: ['Bình thường', 'Bất thường', 'Không nhớ'],
  },
  { name: 'screeningYear', label: 'Năm tầm soát' },
  {
    name: 'gynecologicalDisease',
    label: 'Bệnh phụ khoa',
    component: 'select',
    options: [
      'Không',
      'Viêm CTC',
      'Polyp CTC',
      'U xơ tử cung',
      'Lạc nội mạc TC',
      'Khác',
    ],
  },
  {
    name: 'otherGynecologicalDisease',
    label: 'Bệnh phụ khoa khác',
    placeholder: 'Nhập tên bệnh phụ khoa',
  },
  {
    name: 'underlyingDisease',
    label: 'Bệnh nền',
    component: 'select',
    options: ['Không', 'Cao huyết áp', 'Tiểu đường', 'COPD', 'Béo phì', 'Khác'],
  },
  {
    name: 'otherUnderlyingDisease',
    label: 'Bệnh nền khác',
    placeholder: 'Nhập tên loại bệnh',
  },
  {
    name: 'smoking',
    label: 'Hút thuốc lá',
    component: 'select',
    options: ['Không', 'Đã bỏ', 'Đang hút'],
  },
  {
    name: 'cigarettesPerDay',
    label: 'Số điếu thuốc',
    placeholder: 'Nhập số điếu thuốc',
  },
  {
    name: 'alcohol',
    label: 'Bia rượu',
    component: 'select',
    options: ['Không', 'Thỉnh thoảng', 'Thường xuyên'],
  },
  {
    name: 'hivStatus',
    label: 'Tình trạng HIV',
    component: 'select',
    options: ['Âm tính', 'Dương tính', 'Chưa XN', 'Không trả lời'],
  },
  {
    name: 'immunosuppressant',
    label: 'Thuốc ức chế MD',
    component: 'select',
    options: ['Không', 'Có'],
  },
  {
    name: 'immunosuppressantDrugName',
    label: 'Tên thuốc ức chế MD',
    placeholder: 'Nhập tên thuốc',
  },
  {
    name: 'exercise',
    label: 'Tập thể dục',
    component: 'select',
    options: ['Không', '1-2 lần/tuần', '3+ lần/tuần'],
  },
  {
    name: 'swimming',
    label: 'Bơi lội',
    component: 'select',
    options: ['Không', 'Thỉnh thoảng', 'Thường xuyên'],
  },
  {
    name: 'familyCervicalCancer',
    label: 'GĐ mắc UT CTC?',
    component: 'select',
    options: ['Không', 'Có'],
  },
  {
    name: 'familyCervicalCancerDetail',
    label: 'Chi tiết GĐ mắc UT CTC',
    placeholder: 'Nhập thông tin người thân mắc UT CTC',
  },
  {
    name: 'currentSymptoms',
    label: 'Triệu chứng hiện tại',
    component: 'select',
    options: ['Không', 'Ra máu BT', 'Khí hư BT', 'Đau bụng dưới'],
  },
  {
    name: 'aiResult',
    label: 'Kết quả AI',
    component: 'select',
    options: [
      'Bình thường',
      'Nghi ngờ',
      'Bất thường (Thấp)',
      'Bất thường (Cao)',
      'Không hợp lệ',
    ],
  },
  {
    name: 'doctorComment',
    label: 'Nhận xét của Bác Sĩ',
    component: 'textarea',
  },
  {
    name: 'treatmentPlan',
    label: 'Hướng xử trí',
    component: 'select',
    options: [
      'Tái khám sau 1 năm',
      'Theo dõi 3-6 tháng',
      'Chuyển BV Hùng Vương',
    ],
  },
]

const formFields: HealthFormField[] = baseFormFields.map((field) => ({
  ...field,
  saveData: savedFieldLabels.includes(field.label),
  required: ['patientCode', 'fullName', 'clinicLocation', 'examDate'].includes(
    field.name
  ),
}))

const defaultHealthFormValues: HealthFormValues = {
  ethnicity: '',
  relationshipStatus: '',
  contraception: 'Không',
  hpvVaccinated: 'Chưa tiêm',
  cervicalCancerScreened: 'Chưa bao giờ',
  gynecologicalDisease: 'Không',
  underlyingDisease: 'Không',
  smoking: 'Không',
  alcohol: 'Không',
  hivStatus: 'Âm tính',
  immunosuppressant: 'Không',
  exercise: 'Không',
  swimming: 'Không',
  familyCervicalCancer: 'Không',
  currentSymptoms: 'Không',
  aiResult: 'Bình thường',
  treatmentPlan: 'Tái khám sau 1 năm',
}

const otherFieldMappings = [
  {
    mainField: 'contraception',
    otherField: 'otherContraception',
    triggerValue: 'Khác',
  },
  {
    mainField: 'screeningMethod',
    otherField: 'otherScreeningMethod',
    triggerValue: 'Khác',
  },
  {
    mainField: 'gynecologicalDisease',
    otherField: 'otherGynecologicalDisease',
    triggerValue: 'Khác',
  },
  {
    mainField: 'underlyingDisease',
    otherField: 'otherUnderlyingDisease',
    triggerValue: 'Khác',
  },
  {
    mainField: 'immunosuppressant',
    otherField: 'immunosuppressantDrugName',
    triggerValue: 'Có',
  },
  {
    mainField: 'familyCervicalCancer',
    otherField: 'familyCervicalCancerDetail',
    triggerValue: 'Có',
  },
]

function splitOtherFieldValue(value: string, triggerValue: string) {
  const [prefix, ...remainingParts] = value.split(':')
  const otherValue = remainingParts.join(':').trim()

  if (prefix.trim() !== triggerValue || !otherValue) {
    return null
  }

  return {
    mainValue: triggerValue,
    otherValue,
  }
}

function getStringValue(value: HealthFormValue | undefined) {
  return Array.isArray(value) ? value.join(', ') : value || ''
}

function includesValue(value: HealthFormValue | undefined, option: string) {
  return Array.isArray(value) ? value.includes(option) : value === option
}

function getMultiSelectValue(value: HealthFormValue | undefined) {
  if (Array.isArray(value)) return value

  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .map((item) => (item.startsWith('Khác:') ? 'Khác' : item))
        .filter(Boolean)
    : []
}

function splitMultiSelectOtherValue(value: HealthFormValue | undefined) {
  const values = getStringValue(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const otherItem = values.find((item) => item.startsWith('Khác:'))

  return {
    selectedValues: values.map((item) =>
      item.startsWith('Khác:') ? 'Khác' : item
    ),
    otherValue: otherItem?.replace(/^Khác:\s*/, '').trim() || '',
  }
}

function normalizeParaValue(value?: string) {
  const trimmedValue = value?.trim() || ''
  const digitsOnly = trimmedValue.replace(/\D/g, '')

  if (!digitsOnly) {
    return '0-0-0-0'
  }

  return digitsOnly.slice(0, 4).split('').join('-')
}

function splitSmokingValue(value: string) {
  const match = value.match(/^Đang hút:\s*(.*?)\s*(?:điếu\/ngày)?$/i)

  if (!match?.[1]) {
    return null
  }

  return match[1].trim()
}

function FieldInput({
  field,
  register,
  watch,
  setValue,
}: {
  field: HealthFormField
  register: ReturnType<typeof useForm<HealthFormValues>>['register']
  watch: ReturnType<typeof useForm<HealthFormValues>>['watch']
  setValue: ReturnType<typeof useForm<HealthFormValues>>['setValue']
}) {
  const baseClassName =
    'mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
  const registerOptions = field.required
    ? { required: `${field.label} là bắt buộc` }
    : undefined

  if (field.component === 'textarea') {
    return (
      <textarea
        {...register(field.name, registerOptions)}
        rows={3}
        placeholder={field.placeholder}
        className={baseClassName}
      />
    )
  }

  if (field.component === 'select') {
    if (field.multiple) {
      const selectedValues = watch(field.name)
      const normalizedSelectedValues = Array.isArray(selectedValues)
        ? selectedValues
        : selectedValues
        ? [selectedValues]
        : []

      return (
        <div className="mt-2 grid gap-2 rounded-md border border-slate-300 bg-white p-3 shadow-sm sm:grid-cols-2">
          {field.options?.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <input
                type="checkbox"
                checked={normalizedSelectedValues.includes(option)}
                onChange={(event) => {
                  const nextValues = event.target.checked
                    ? [...normalizedSelectedValues, option]
                    : normalizedSelectedValues.filter(
                        (value) => value !== option
                      )

                  setValue(field.name, nextValues, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {option}
            </label>
          ))}
        </div>
      )
    }

    return (
      <select
        {...register(field.name, registerOptions)}
        className={baseClassName}
      >
        <option value="">Chọn thông tin</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      {...register(field.name, registerOptions)}
      type="text"
      placeholder={field.placeholder}
      className={baseClassName}
    />
  )
}

export default function HealthForm() {
  const authUser = useUserStore((state) => state.authUser)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { recordId } = useParams<{ recordId: string }>()
  const { showError, showTypedToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [pendingDuplicateSave, setPendingDuplicateSave] =
    useState<PendingDuplicateSave>(null)
  const isUpdateMode = Boolean(recordId)
  const { data: updatingRecord, isLoading: isLoadingUpdatingRecord } = useQuery(
    {
      queryKey: ['health-form', 'record', recordId],
      queryFn: () => getHealthFormRecordById(recordId || ''),
      enabled: isUpdateMode,
    }
  )
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HealthFormValues>({
    defaultValues: defaultHealthFormValues,
  })

  useEffect(() => {
    if (!isUpdateMode || !updatingRecord) return

    const formValues = formFields.reduce<HealthFormValues>((result, field) => {
      const value = updatingRecord[field.name]
      result[field.name] =
        typeof value === 'string' ? value : String(value ?? '')
      return result
    }, {})

    otherFieldMappings.forEach(({ mainField, otherField, triggerValue }) => {
      const splitValue = splitOtherFieldValue(
        getStringValue(formValues[mainField]),
        triggerValue
      )

      if (!splitValue) return

      formValues[mainField] = splitValue.mainValue
      formValues[otherField] = splitValue.otherValue
    })

    formFields
      .filter((field) => field.multiple)
      .forEach((field) => {
        if (field.name === 'screeningMethod') {
          const { selectedValues, otherValue } = splitMultiSelectOtherValue(
            formValues[field.name]
          )

          formValues[field.name] = selectedValues
          formValues.otherScreeningMethod = otherValue
          return
        }

        formValues[field.name] = getMultiSelectValue(formValues[field.name])
      })

    const cigarettesPerDay = splitSmokingValue(
      getStringValue(formValues.smoking)
    )

    if (cigarettesPerDay) {
      formValues.smoking = 'Đang hút'
      formValues.cigarettesPerDay = cigarettesPerDay
    }

    reset(formValues)
  }, [isUpdateMode, reset, updatingRecord])

  useEffect(() => {
    if (!isUpdateMode || isLoadingUpdatingRecord || updatingRecord) return

    showError('Không tìm thấy HealthForm cần cập nhật.')
    navigate('/list-healthform')
  }, [
    isLoadingUpdatingRecord,
    isUpdateMode,
    navigate,
    showError,
    updatingRecord,
  ])

  const contraception = watch('contraception')
  const hpvVaccinated = watch('hpvVaccinated')
  const cervicalCancerScreened = watch('cervicalCancerScreened')
  const screeningMethod = watch('screeningMethod')
  const gynecologicalDisease = watch('gynecologicalDisease')
  const underlyingDisease = watch('underlyingDisease')
  const smoking = watch('smoking')
  const immunosuppressant = watch('immunosuppressant')
  const familyCervicalCancer = watch('familyCervicalCancer')

  useEffect(() => {
    if (contraception !== 'Thuốc uống') {
      setValue('contraceptionYears', '')
    }
    if (contraception !== 'Khác') {
      setValue('otherContraception', '')
    }
  }, [contraception, setValue])

  useEffect(() => {
    if (hpvVaccinated !== 'Đã tiêm') {
      setValue('hpvVaccineType', '')
      setValue('hpvDoseCount', '')
    }
  }, [hpvVaccinated, setValue])

  useEffect(() => {
    if (!includesValue(screeningMethod, 'Khác')) {
      setValue('otherScreeningMethod', '')
    }
  }, [screeningMethod, setValue])

  useEffect(() => {
    if (gynecologicalDisease !== 'Khác') {
      setValue('otherGynecologicalDisease', '')
    }
  }, [gynecologicalDisease, setValue])

  useEffect(() => {
    if (underlyingDisease !== 'Khác') {
      setValue('otherUnderlyingDisease', '')
    }
  }, [underlyingDisease, setValue])

  useEffect(() => {
    if (smoking !== 'Đang hút') {
      setValue('cigarettesPerDay', '')
    }
  }, [smoking, setValue])

  useEffect(() => {
    if (immunosuppressant !== 'Có') {
      setValue('immunosuppressantDrugName', '')
    }
  }, [immunosuppressant, setValue])

  useEffect(() => {
    if (familyCervicalCancer !== 'Có') {
      setValue('familyCervicalCancerDetail', '')
    }
  }, [familyCervicalCancer, setValue])

  function shouldHideField(fieldName: string) {
    const shouldHideContraceptionFields =
      contraception !== 'Thuốc uống' && fieldName === 'contraceptionYears'
    const shouldHideOtherContraception =
      contraception !== 'Khác' && fieldName === 'otherContraception'
    const shouldHideHpvFields =
      hpvVaccinated !== 'Đã tiêm' &&
      ['hpvVaccineType', 'hpvDoseCount'].includes(fieldName)
    const shouldHideOtherScreeningMethod =
      !includesValue(screeningMethod, 'Khác') &&
      fieldName === 'otherScreeningMethod'
    const shouldHideOtherGynecologicalDisease =
      gynecologicalDisease !== 'Khác' &&
      fieldName === 'otherGynecologicalDisease'
    const shouldHideOtherUnderlyingDisease =
      underlyingDisease !== 'Khác' && fieldName === 'otherUnderlyingDisease'
    const shouldHideSmokingFields =
      smoking !== 'Đang hút' && fieldName === 'cigarettesPerDay'
    const shouldHideImmunosuppressantFields =
      immunosuppressant !== 'Có' && fieldName === 'immunosuppressantDrugName'
    const shouldHideFamilyCervicalCancerFields =
      familyCervicalCancer !== 'Có' &&
      fieldName === 'familyCervicalCancerDetail'

    return (
      shouldHideContraceptionFields ||
      shouldHideOtherContraception ||
      shouldHideHpvFields ||
      shouldHideOtherScreeningMethod ||
      shouldHideOtherGynecologicalDisease ||
      shouldHideOtherUnderlyingDisease ||
      shouldHideSmokingFields ||
      shouldHideImmunosuppressantFields ||
      shouldHideFamilyCervicalCancerFields
    )
  }

  function getSavedHealthFormValues(values: HealthFormValues) {
    const savedValues = formFields
      .filter((field) => field.saveData)
      .reduce<HealthFormValues>((result, field) => {
        result[field.name] = getStringValue(values[field.name])
        return result
      }, {})

    savedValues.para = normalizeParaValue(getStringValue(values.para))
    savedValues.fullName = getStringValue(values.fullName).trim().toUpperCase()

    otherFieldMappings.forEach(({ mainField, otherField, triggerValue }) => {
      const field = formFields.find((formField) => formField.name === mainField)

      if (field?.multiple) return

      const otherValue = getStringValue(values[otherField]).trim()

      if (!includesValue(values[mainField], triggerValue) || !otherValue) return

      savedValues[mainField] = `${triggerValue}: ${otherValue}`
    })

    if (Array.isArray(values.screeningMethod)) {
      const otherScreeningMethod = getStringValue(
        values.otherScreeningMethod
      ).trim()

      savedValues.screeningMethod = values.screeningMethod
        .map((value) =>
          value === 'Khác' && otherScreeningMethod
            ? `Khác: ${otherScreeningMethod}`
            : value
        )
        .join(', ')
    }

    const cigarettesPerDay = getStringValue(values.cigarettesPerDay).trim()

    if (values.smoking === 'Đang hút' && cigarettesPerDay) {
      savedValues.smoking = `Đang hút: ${cigarettesPerDay} điếu/ngày`
    }

    return savedValues
  }

  async function saveHealthForm(values: HealthFormValues) {
    if (!authUser?.uid) {
      throw new Error('User is not authenticated')
    }

    const savedValues = getSavedHealthFormValues(values)

    await addHealthFormRecord({
      ...savedValues,
      creator: authUser.uid,
    })
  }

  async function onSubmit(values: HealthFormValues) {
    if (!authUser?.uid) {
      showError('Bạn cần đăng nhập trước khi lưu thông tin.')
      return
    }

    setIsSaving(true)

    try {
      if (isUpdateMode && recordId) {
        await saveUpdatedHealthForm(recordId, values)
        showTypedToast(EToastTypes.SUCCESS, 'Đã cập nhật thông tin sức khỏe')
        await queryClient.invalidateQueries({ queryKey: ['health-form'] })
        navigate('/list-healthform')
        return
      }

      const duplicateRecord = await findDuplicateHealthFormRecord({
        creator: authUser.uid,
        patientCode: getStringValue(values.patientCode),
        fullName: getStringValue(values.fullName),
        examDate: getStringValue(values.examDate),
        clinicLocation: getStringValue(values.clinicLocation),
      })

      if (duplicateRecord) {
        setPendingDuplicateSave({
          values,
          patientCode: getStringValue(values.patientCode),
          fullName: getStringValue(values.fullName),
        })
        return
      }

      await saveHealthForm(values)
      showTypedToast(EToastTypes.SUCCESS, 'Đã lưu thông tin sức khỏe')
      resetNewFormKeepingExamInfo(values)
    } catch (error) {
      showError(
        'Không thêm được thông tin vào cơ sở dữ liệu. Vui lòng thử lại.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmDuplicateSave() {
    if (!pendingDuplicateSave) return

    setIsSaving(true)

    try {
      await saveHealthForm(pendingDuplicateSave.values)
      showTypedToast(EToastTypes.SUCCESS, 'Đã lưu thông tin sức khỏe')
      setPendingDuplicateSave(null)
      resetNewFormKeepingExamInfo(pendingDuplicateSave.values)
    } catch (error) {
      showError(
        'Không thêm được thông tin vào cơ sở dữ liệu. Vui lòng thử lại.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function saveUpdatedHealthForm(
    recordId: string,
    values: HealthFormValues
  ) {
    const savedValues = getSavedHealthFormValues(values)

    await updateHealthFormRecord(recordId, savedValues)
  }

  function resetNewFormKeepingExamInfo(values: HealthFormValues) {
    const emptyValues = formFields.reduce<HealthFormValues>((result, field) => {
      result[field.name] = ''
      return result
    }, {})

    reset({
      ...emptyValues,
      clinicLocation: getStringValue(values.clinicLocation),
      examDate: getStringValue(values.examDate),
    })
  }

  if (isLoadingUpdatingRecord) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
          Đang tải thông tin HealthForm...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-7xl space-y-6"
      >
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {formFields.map((field) =>
              shouldHideField(field.name) ? null : (
                <label
                  key={field.name}
                  className={
                    field.component === 'textarea'
                      ? 'block md:col-span-2 xl:col-span-3'
                      : 'block'
                  }
                >
                  <span className="text-sm font-bold text-slate-700">
                    {field.label}
                    {field.required ? (
                      <span className="text-red-500"> *</span>
                    ) : null}
                  </span>
                  <FieldInput
                    field={field}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                  {errors[field.name]?.message ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.name]?.message}
                    </p>
                  ) : null}
                </label>
              )
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSaving}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {isUpdateMode ? 'Reset form' : 'Xóa form'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? isUpdateMode
                ? 'Đang cập nhật...'
                : 'Đang lưu...'
              : isUpdateMode
              ? 'Cập nhật thông tin'
              : 'Lưu thông tin'}
          </button>
        </div>
      </form>

      <Dialog
        open={Boolean(pendingDuplicateSave)}
        onOpenChange={(open) => {
          if (!open) setPendingDuplicateSave(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thêm thông tin</DialogTitle>
            <DialogDescription>
              Đã có bệnh nhân {pendingDuplicateSave?.fullName}, mã số:{' '}
              {pendingDuplicateSave?.patientCode}. Bạn có muốn thêm không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDuplicateSave(null)}
              disabled={isSaving}
            >
              Không
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDuplicateSave}
              disabled={isSaving}
            >
              {isSaving ? 'Đang thêm...' : 'Có, thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
