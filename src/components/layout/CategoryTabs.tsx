import clsx from "clsx"
import { type FC, useMemo } from "react"
import { useNavigate, useParams } from "react-router"

import { useAppDispatch } from "@/app/hooks"
import { ROUTES } from "@/constants/routes"
import { useGetCategoriesQuery } from "@/features/api/category/categoryApi"
import { setSelectedCategoryById, setSelectedCategoryByName } from "@/features/markets/marketSlice"
import { CATEGORIES } from "@/mocks/mockData"

export const CategoryTabs: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { category: activeCategoryName } = useParams<{ category?: string }>()
  const { data } = useGetCategoriesQuery()

  const allCategories = useMemo(() => {
    const apiCategories = data ?? []
    const mockCategories = CATEGORIES.map((name, i) => ({ id: `mock-${i}`, name: name.name }))
    return [...mockCategories, ...apiCategories]
  }, [data])

  return (
    <div className="container border-b border-border/70 bg-background sticky top-14 z-40 md:px-15 font-liberation">
      <div className=" overflow-x-auto no-scrollbar">
        <div className="flex items-center  gap-2 mb-1 h-9  ">
          {
            <button
              key={`allmarkets`}
              onClick={() => {
                dispatch(setSelectedCategoryById("allmarkets"))
                dispatch(setSelectedCategoryByName("All Markets"))
                navigate(
                  ROUTES.MarketCategory.replace(":category", encodeURIComponent("All%20Markets")),
                )
              }}
              className={clsx(
                "relative h-full flex items-center font-base font-bold transition-colors duration-200 whitespace-nowrap py-2 px-3",
                decodeURIComponent(activeCategoryName as string) === "All Markets"
                  ? "text-[#f1f8f4]"
                  : "text-secondary hover:text-white",
              )}
            >
              {"ALL MARKETS"}
              {decodeURIComponent(activeCategoryName as string) === "All Markets" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00c853] shadow-[0_0_8px_rgba(0,200,83,0.5)]" />
              )}
            </button>
          }
          {allCategories.map((category) => {
            const isActive = activeCategoryName
              ? decodeURIComponent(activeCategoryName) === category.name
              : false

            return (
              <button
                key={category.id}
                onClick={() => {
                  dispatch(setSelectedCategoryById(category.id))
                  dispatch(setSelectedCategoryByName(category.name))
                  navigate(
                    ROUTES.MarketCategory.replace(":category", encodeURIComponent(category.name)),
                  )
                }}
                className={clsx(
                  "relative h-full flex items-center font-base font-bold transition-colors duration-200 whitespace-nowrap py-2 px-3",
                  isActive ? "text-[#f1f8f4]" : "text-secondary hover:text-white",
                )}
              >
                {category.name.toUpperCase()}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00c853] shadow-[0_0_8px_rgba(0,200,83,0.5)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
