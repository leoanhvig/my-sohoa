import { addHealthFormRecord } from '@/apis/healthForm2'
import { Button } from '@/Components/ui/button'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useUserStore } from '@/stores/userStore'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type FormSK2Value = string | string[]
type FormSK2Values = Record<string, FormSK2Value>

type FormSK2Field = {
  name: string
  label: string
  component?: 'input' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  multiple?: boolean
  required?: boolean
}

const formSK2Fields: FormSK2Field[] = [
  {
    name: 'clinicLocation',
    label: 'Địa điểm',
    component: 'select',
    options: [
      'Nhà VH Lao Động Thuận An',
      'Nhà VH Lao Động Bến Cát',
      'Nhà VH Lao Động Phú Mỹ',
    ],
  },
  {
    name: 'examDate',
    label: 'Ngày khám',
    component: 'select',
    options: ['23/5/26', '24/5/26', '30/5/26', '31/5/26'],
  },
  { name: 'patientCode', label: 'STT/Mã Bệnh Nhân', required: true },
  { name: 'fullName', label: 'Họ tên', required: true },
  { name: 'birthDate', label: 'Ngày sinh' },
  { name: 'citizenId', label: 'Số CCCD' },
  { name: 'healthInsuranceNumber', label: 'Số thẻ BHYT' },
  { name: 'occupation', label: 'Nghề nghiệp' },
  { name: 'hamlet', label: 'Khu phố/Ấp' },
  { name: 'ward', label: 'Xã/Phường/Đặc khu' },
  { name: 'provinceCity', label: 'Tỉnh/TP' },
  { name: 'phoneNumber', label: 'Số điện thoại' },
  {
    name: 'doctorComment',
    label: 'Nhận xét của Bác Sĩ',
    component: 'textarea',
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
    name: 'treatmentPlan',
    label: 'Hướng xử trí',
    component: 'select',
    options: [
      'Theo dõi tại trạm y tế',
      'Khám chuyên khoa, chuyển tuyến hoặc điều trị tiếp',
      'Tái khám sau 1 năm',
      'Theo dõi 3-6 tháng',
      'Chuyển BV Hùng Vương',
    ],
  },
]

const defaultFormSK2Values: FormSK2Values = {
  ...formSK2Fields.reduce<FormSK2Values>((result, field) => {
    result[field.name] = field.multiple ? [] : ''
    return result
  }, {}),
  gender: 'Nữ',
}

function getStringValue(value: FormSK2Value | undefined) {
  return Array.isArray(value) ? value.join(', ') : value || ''
}

function FieldInput({
  field,
  register,
  watch,
  setValue,
}: {
  field: FormSK2Field
  register: ReturnType<typeof useForm<FormSK2Values>>['register']
  watch: ReturnType<typeof useForm<FormSK2Values>>['watch']
  setValue: ReturnType<typeof useForm<FormSK2Values>>['setValue']
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
    const selectedValues = watch(field.name)
    const normalizedSelectedValues = Array.isArray(selectedValues)
      ? selectedValues
      : selectedValues
      ? [selectedValues]
      : []

    if (field.multiple) {
      return (
        <div className="mt-2 flex flex-wrap gap-3 rounded-md border border-slate-300 bg-white p-3 shadow-sm">
          <input
            type="hidden"
            {...register(field.name, registerOptions)}
            value={getStringValue(normalizedSelectedValues)}
          />
          {field.options?.map((option) => (
            <label
              key={option}
              className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 sm:px-3 sm:py-2"
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
                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 sm:h-4 sm:w-4"
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
        <option value="">Chọn {field.label.toLowerCase()}</option>
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

export default function FormSK2() {
  const authUser = useUserStore((state) => state.authUser)
  const queryClient = useQueryClient()
  const { showError, showTypedToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormSK2Values>({
    defaultValues: defaultFormSK2Values,
  })

  async function onSubmit(values: FormSK2Values) {
    if (!authUser?.uid) {
      showError('Bạn cần đăng nhập trước khi lưu thông tin.')
      return
    }

    setIsSaving(true)

    try {
      const savedValues = formSK2Fields.reduce<FormSK2Values>(
        (result, field) => {
          const fieldValue = getStringValue(values[field.name])

          result[field.name] = ['fullName', 'healthInsuranceNumber'].includes(
            field.name
          )
            ? fieldValue.toUpperCase()
            : fieldValue
          return result
        },
        { gender: 'Nữ' }
      )

      await addHealthFormRecord({
        ...savedValues,
        creator: authUser.uid,
      })
      await queryClient.invalidateQueries({ queryKey: ['health-form'] })
      showTypedToast(EToastTypes.SUCCESS, 'Đã lưu thông tin SK2')
      reset(defaultFormSK2Values)
    } catch (error) {
      showError(
        'Không thêm được thông tin vào cơ sở dữ liệu. Vui lòng thử lại.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-7xl space-y-6"
      >
        <section className="bg-white p-6 shadow-sm">
          {formSK2Fields.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {formSK2Fields.map((field) => (
                <label
                  key={field.name}
                  className={
                    field.component === 'textarea'
                      ? 'block md:col-span-2'
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
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
              Chưa có input nào. Hãy gửi danh sách field cần hiển thị để thêm
              vào Form SK2.
            </div>
          )}
        </section>

        <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Button
            type="submit"
            disabled={isSaving || formSK2Fields.length === 0}
            className="h-11 rounded-lg bg-indigo-600 px-8 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </div>
      </form>
    </main>
  )
}
