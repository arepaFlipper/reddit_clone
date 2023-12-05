"use client"

import { useState, useCallback } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Prisma, Subreddit } from "@prisma/client";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";

type TSearchBar = {}

const SearchBar = (props: TSearchBar) => {
  const [input, setInput] = useState<string>("")

  const queryFn = async () => {
    if (!input) {
      return [];
    }
    const { data } = await axios.get(`/api/search?q=${input}`);
    return data as (Subreddit & { _count: Prisma.SubredditCountOutputType })[];
  }

  const { data, refetch, isFetched, isFetching } = useQuery({
    queryFn,
    queryKey: ["search-key"],
    enabled: false,
  });

  const request = debounce(async () => {
    await refetch();
  }, 300)

  const debounceRequest = useCallback(() => {
    request();
  }, [])


  const on_value_change = (text: string) => {
    setInput(text)
    debounceRequest();
  }

  const router = useRouter();
  return (
    <Command className="relative rounded-lg border max-w-lg z-50  overflow-visible">
      <CommandInput value={input} onValueChange={on_value_change} className="outline-none border-none focus:border-none focus:outline-none ring-0" placeholder="Search communities..." />
      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && (<CommandEmpty>No results found.</CommandEmpty>)}
          {(data?.length ?? 0) > 0 && (
            <CommandGroup heading="Communities">
              {data?.map((subreddit: Subreddit) => {
                const on_select = (event: any) => {
                  event.preventDefault();
                  router.push(`/r/${event}`);
                  router.refresh();
                }
                return (
                  <CommandItem onSelect={on_select} key={subreddit.id} value={subreddit.name}>
                    <Users className="mr-2 h-4 w-4" />
                    <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  )
}

export default SearchBar
