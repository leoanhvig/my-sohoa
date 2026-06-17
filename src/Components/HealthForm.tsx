import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type HealthFormValues = Record<string, string>

type HealthFormField = {
  name: string
  label: string
  component?: 'input' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  saveData?: boolean
}

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
  'Chi tiết',
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
  { name: 'patientCode', label: 'STT/Mã bệnh nhân' },
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
    options: ['09/05/2026', '10/05/2026', '16/05/2026', '17/05/2026'],
  },
  { name: 'fullName', label: 'Họ và Tên' },
  { name: 'birthYear', label: 'Năm sinh' },
  { name: 'age', label: 'Tuổi' },
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
  { name: 'para', label: 'PARA', placeholder: 'Ví dụ 3-0-0-3' },
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
    ],
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
}))

function FieldInput({
  field,
  register,
}: {
  field: HealthFormField
  register: ReturnType<typeof useForm<HealthFormValues>>['register']
}) {
  const baseClassName =
    'mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'

  if (field.component === 'textarea') {
    return (
      <textarea
        {...register(field.name)}
        rows={3}
        placeholder={field.placeholder}
        className={baseClassName}
      />
    )
  }

  if (field.component === 'select') {
    return (
      <select {...register(field.name)} className={baseClassName}>
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
      {...register(field.name)}
      type="text"
      placeholder={field.placeholder}
      className={baseClassName}
    />
  )
}

export default function HealthForm() {
  const { handleSubmit, register, reset, setValue, watch } =
    useForm<HealthFormValues>({
      defaultValues: {
        ethnicity: 'Kinh',
        relationshipStatus: 'Một bạn đời',
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
      },
    })
  const contraception = watch('contraception')
  const hpvVaccinated = watch('hpvVaccinated')
  const cervicalCancerScreened = watch('cervicalCancerScreened')
  const screeningMethod = watch('screeningMethod')
  const underlyingDisease = watch('underlyingDisease')
  const smoking = watch('smoking')
  const immunosuppressant = watch('immunosuppressant')

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
    if (cervicalCancerScreened !== 'Đã từng') {
      setValue('screeningMethod', '')
      setValue('otherScreeningMethod', '')
      setValue('screeningResult', '')
      setValue('screeningYear', '')
    }
  }, [cervicalCancerScreened, setValue])

  useEffect(() => {
    if (screeningMethod !== 'Khác') {
      setValue('otherScreeningMethod', '')
    }
  }, [screeningMethod, setValue])

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

  function shouldHideField(fieldName: string) {
    const shouldHideContraceptionFields =
      contraception !== 'Thuốc uống' && fieldName === 'contraceptionYears'
    const shouldHideOtherContraception =
      contraception !== 'Khác' && fieldName === 'otherContraception'
    const shouldHideHpvFields =
      hpvVaccinated !== 'Đã tiêm' &&
      ['hpvVaccineType', 'hpvDoseCount'].includes(fieldName)
    const shouldHideScreeningFields =
      cervicalCancerScreened !== 'Đã từng' &&
      ['screeningMethod', 'screeningResult', 'screeningYear'].includes(
        fieldName
      )
    const shouldHideOtherScreeningMethod =
      (cervicalCancerScreened !== 'Đã từng' || screeningMethod !== 'Khác') &&
      fieldName === 'otherScreeningMethod'
    const shouldHideOtherUnderlyingDisease =
      underlyingDisease !== 'Khác' && fieldName === 'otherUnderlyingDisease'
    const shouldHideSmokingFields =
      smoking !== 'Đang hút' && fieldName === 'cigarettesPerDay'
    const shouldHideImmunosuppressantFields =
      immunosuppressant !== 'Có' && fieldName === 'immunosuppressantDrugName'

    return (
      shouldHideContraceptionFields ||
      shouldHideOtherContraception ||
      shouldHideHpvFields ||
      shouldHideScreeningFields ||
      shouldHideOtherScreeningMethod ||
      shouldHideOtherUnderlyingDisease ||
      shouldHideSmokingFields ||
      shouldHideImmunosuppressantFields
    )
  }

  function onSubmit(values: HealthFormValues) {
    const savedValues = formFields
      .filter((field) => field.saveData)
      .reduce<HealthFormValues>((result, field) => {
        result[field.name] = values[field.name] || ''
        return result
      }, {})

    console.log('Health form saved values:', savedValues)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-7xl space-y-6"
      >
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Form sức khỏe
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Nhập thông tin khám, tiền sử và hướng xử trí của bệnh nhân.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Xóa form
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </section>

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
                  </span>
                  <FieldInput field={field} register={register} />
                </label>
              )
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Xóa form
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Lưu thông tin
          </button>
        </div>
      </form>
    </main>
  )
}
